<template>
    <div style="height: 100%">
        <ons-progress-circular indeterminate v-if="loading">
        </ons-progress-circular>
        <div :id="mapId" v-on:touchstart="stopPropagation"></div>
        <div class="map-control-templates">
            <div ref="attribution">
                <a href="http://www.openmaptiles.org/" target="_blank">
                    &copy; OpenMapTiles
                </a>
                <a href="http://www.openstreetmap.org/about/" target="_blank">
                    &copy; OpenStreetMap contributors
                </a>
            </div>
        </div>
        <div class="popup" v-if="selectedResource">
            <div class="popup-content">
                <div class="popup-header">
                    <div class="icon-circle" v-bind:style="{ background: [resource_types[selectedResource.graph_id].color], color: '#fff' }">
                        <v-ons-icon class="resource-model-icon" v-bind:icon="resource_types[selectedResource.graph_id].iconclass.replace('fa ', '')"></v-ons-icon>
                    </div>
                    <span class='resource-model-title'>
                        <span style="padding-left: 0; padding-right: 10px;">
                            {{selectedResource.displayname.replace(/['"]+/g,'')}}
                        </span>
                        <span class="resource-model-subtitle">
                            {{resource_types[selectedResource.graph_id].name}}
                        </span>
                    </span>
                    <span @click="closePopup()">
                        <div class="popup-close fa fa-times"></div>
                    </span>
                </div>
                <div class="description">
                    {{ selectedResource.displaydescription.replace(/['"]+/g,'') }}
                </div>
            </div>
            <v-ons-button class="edit-button" v-on:click="selectResourceInstance(selectedResource)">
                <span>Edit Resource</span>
            </v-ons-button>
        </div>
    </div>
</template>

<script>
import geojsonExtent from '@mapbox/geojson-extent';
import uuidv4 from 'uuid/v4';
import 'mapbox-gl-cordova-offline/www/mapbox-gl.css';
// TODO: pull basemap layer styles from project?
import basemapLayers from '../../../assets/map/basemap_layers.json';

const mapboxgl = window.mapboxgl;

export default {
    name: 'ProjectMap',
    props: ['extent'],
    data() {
        var project = this.$store.getters.activeProject;
        return {
            project: project,
            mapId: `project-map-${uuidv4()}`,
            bounds: new mapboxgl.LngLatBounds(
                geojsonExtent(
                    this.extent
                )
            ),
            resourceGeoJSON: {
                type: 'FeatureCollection',
                features: []
            },
            instances: [],
            tiles: [],
            selectedResource: null,
            loading: true,
            resource_types: {},
            user: this.$store.getters.activeServer.user.id,
            onlinebasemap: project.onlinebasemaps ? project.onlinebasemaps.default : 'mapbox://styles/mapbox/satellite-v9'
        };
    },
    methods: {
        closePopup: function() {
            this.selectedResource = null;
            ['resource-point', 'resource-polygon', 'resource-line'].forEach(function(layer) {
                var paintProperties = this.getPaintProperties(layer);
                Object.keys(paintProperties).forEach(function(paintProperty) {
                    this.map.setPaintProperty(layer, paintProperty, paintProperties[paintProperty]);
                }, this);
            }, this);
        },
        selectResourceInstance: function(resource) {
            return this.$store.dispatch(
                'getResource',
                {'projectId': this.project.id, 'resourceinstanceid': resource.id}
            ).then((ret) => {
                var resource = ret.docs[0];
                this.$store.commit('setActiveResourceInstance', resource);
                this.$store.commit('setActiveGraphId', resource.graph_id);
                this.$router.push({
                    'name': 'resource',
                    params: {
                        'nodegroupid': null,
                        'tabIndex': 1
                    }
                });
            });
        },
        setupBasemaps: function() {
            return this.$store.dispatch(
                'setupProjectBasemaps',
                this.project
            );
        },
        getResourceData: function() {
            var self = this;
            return this.$store.dispatch(
                'getProjectResources',
                this.$store.getters.activeProject.id
            ).then((res) => {
                self.instances = res['docs'];
            }).then(() => {
                return this.$store.dispatch(
                        'getOnlyTiles',
                        this.$store.getters.activeProject.id
                    )
            }).then((res) => {
                self.tiles = res['docs'];
            })
        },
        mapOnlineInit: function() {
            var self = this;
            var resources;
            mapboxgl.accessToken = self.project.mapboxkey;
            var map = new mapboxgl.Map(this.getMapConfig(false));
            map.on('load', function() {
                map.addControl(new mapboxgl.NavigationControl());
                map.addControl(new mapboxgl.GeolocateControl({
                    positionOptions: {
                        enableHighAccuracy: true
                    },
                    trackUserLocation: true
                }));
                self.setMapExtent(map);
                map.addSource('resources', {type: 'geojson', data: self.resourceGeoJSON});
                self.addResourceFeatures(map);
                self.$emit('map-init', map);
                self.loading = false;
            });
        },
        mapOfflineInit: function() {
            var self = this;
            var resources;
            return new mapboxgl.OfflineMap(this.getMapConfig(true))
                .then((map) => {
                    map.addControl(new mapboxgl.NavigationControl());
                    map.addControl(new mapboxgl.GeolocateControl({
                        positionOptions: {
                            enableHighAccuracy: true
                        },
                        trackUserLocation: true
                    }));
                    this.setMapExtent(map);
                    this.addResourceFeatures(map);
                    this.$emit('map-init', map);
                }).catch(error => {
                    console.log('map init error:', error.message);
                }, self);
        },
        getMapConfig: function(offline) {
            console.log('getting geojson')
            this.resourceGeoJSON = this.getResourceGeoJson();
            var offlineStyle = {
                version: 8,
                sources: {
                    openmaptiles: {
                        type: 'mbtiles',
                        path: `${this.project.id}.mbtiles`,
                        attribution: this.$refs.attribution.innerHTML
                    },
                    resources: {
                        type: 'geojson',
                        data: this.resourceGeoJSON
                    }
                },
                sprite: 'static/map/styles/klokantech-basic/sprite',
                glyphs: 'static/map/fonts/{fontstack}/{range}.pbf',
                layers: basemapLayers
            };

            var style = offline ? offlineStyle : this.onlinebasemap;

            return {
                container: this.mapId,
                style: style,
                hash: true,
                maxZoom: 19
            };
        },
        setMapExtent: function(map) {
            const tr = map.transform;
            const nw = tr.project(this.bounds.getNorthWest());
            const se = tr.project(this.bounds.getSouthEast());
            const size = se.sub(nw);
            const scaleX = (tr.width - 80) / size.x;
            const scaleY = (tr.height - 80) / size.y;
            map.jumpTo({
                center: tr.unproject(nw.add(se).div(2)),
                zoom: tr.scaleZoom(tr.scale * Math.min(scaleX, scaleY))
            });
            map.addSource('extent', {type: 'geojson', data: this.extent});
            map.addLayer({
                id: "project-extent-casing",
                type: "line",
                source: "extent",
                layout: {},
                paint: {
                    "line-color": "#fff",
                    "line-width": 5,
                    "line-opacity": 0.8
                }
            });
            map.addLayer({
                id: "project-extent",
                type: "line",
                source: "extent",
                layout: {},
                paint: {
                    "line-color": "#010195",
                    "line-width": 1,
                    "line-opacity": 0.8
                }
            });
        },
        getPaintStyle: function(resourceid, selectedStyle, defaultStyle){
            var propertyExpression = ["case"];
            var selectedResourceId = resourceid || null;
            propertyExpression.push(["==", ["get", "id"], selectedResourceId])
            propertyExpression = propertyExpression.concat(selectedStyle);
            propertyExpression = propertyExpression.concat(defaultStyle);
            return propertyExpression;
        },
        getPaintProperties: function(layerId, resourceid){
            // the assumption here is if you pass a resourceid then
            // you want to render that feature as "selected"

            var colorExpression = [];
            this.project.graphs.forEach(function(graph) {
                colorExpression.push(["==", ["get", "graph_id"], graph.graphid])
                colorExpression.push(graph.color || '#a30000');
            });
            colorExpression.push("#a30000")
            colorExpression = this.getPaintStyle(resourceid, "#1F90F8", colorExpression);

            switch(layerId){
                case 'resource-point':
                    return {
                        "circle-color": colorExpression,
                        "circle-radius": this.getPaintStyle(resourceid, 8, 7),
                        "circle-stroke-width": this.getPaintStyle(resourceid, 3, 1),
                        "circle-stroke-color": this.getPaintStyle(resourceid, "#a30000", "#888")
                    }
                case 'resource-line':
                    return {
                        "line-color": colorExpression,
                        "line-width": this.getPaintStyle(resourceid, 5, 3),
                    }
                case 'resource-polygon':
                    return {
                        "fill-color": colorExpression,
                        "fill-opacity": this.getPaintStyle(resourceid, 0.5, 0.5),
                        "fill-outline-color": this.getPaintStyle(resourceid, "#a30000", "#fff")
                    }
            }
        },
        getResourceGeoJson: function() {
            var features = [];
            var self = this;
            this.tiles.forEach(function(tile) {
                var geojson;
                var tiledata;
                if (tile.provisionaledits && tile.provisionaledits[this.user]) {
                    tiledata = tile.provisionaledits[this.user].value;
                } else if (tile.data) {
                    tiledata = tile.data;
                }
                Object.entries(tiledata).forEach(
                    ([key, value]) => {
                        var instance = this.instances.find(function(resource){return resource.resourceinstanceid === tile.resourceinstance_id})
                        if (value && value.type === 'FeatureCollection') {
                            value.features.forEach(function(feature) {
                                feature.properties.id = tile.resourceinstance_id;
                                feature.properties.tileid = tile.tileid;
                                feature.properties.graph_id = instance.graph_id;
                                feature.properties.displayname = instance.displayname;
                                feature.properties.displaydescription = instance.displaydescription;
                            });
                            value.features.forEach(function(f){
                                features.push(f);
                            });
                        }
                    }, this);
            }, this);
            return {
                type: 'FeatureCollection',
                features: features
            };
        },
        addResourceFeatures: function(map) {
            map.addLayer({
                id: "resource-point",
                type: "circle",
                source: "resources",
                paint: this.getPaintProperties('resource-point'),
                filter: ["==", "$type", "Point"]
            });

            map.addLayer({
                id: "resource-polygon",
                type: "fill",
                source: "resources",
                layout: {},
                paint: this.getPaintProperties('resource-polygon'),
                filter: ["==", "$type", "Polygon"]
            });

            map.addLayer({
                id: "resource-line",
                type: "line",
                source: "resources",
                layout: {
                    "line-join": "round",
                    "line-cap": "round"
                },
                paint: this.getPaintProperties('resource-line')
            });

            ['resource-point', 'resource-polygon', 'resource-line'].forEach(function(layer){
                map.on('click', layer, (e) => {
                    const feature = e.features[0];
                    this.selectedResource = feature.properties;
                    ['resource-point', 'resource-polygon', 'resource-line'].forEach(function(layer){
                        var paintProperties = this.getPaintProperties(layer, this.selectedResource.id);
                        Object.keys(paintProperties).forEach(function(paintProperty) {
                            this.map.setPaintProperty(layer, paintProperty, paintProperties[paintProperty]);
                        }, this);
                    }, this);
                });
            }, this);

            this.map = map;
        },
        stopPropagation: function(e) {
            e.stopPropagation();
        }
    },
    mounted() {
        var self = this;
        var project = this.$store.getters.activeProject;
        this.$store.dispatch('getProjectChanges', project.id)
            .finally(function(doc) {
                self.changes = doc;
            });

        console.log(this.project.useonlinebasemaps)
        if (this.project.useonlinebasemaps) {
            self.getResourceData()
            .then(
                self.mapOnlineInit
            );
        } else {
            this.getResourceData()
            .then(this.mapOfflineInit)
            .then(() => {
                this.loading = false;
            }).catch(function(err) {
                console.log('Unable to initialize offline basemap', err);
            });
        }

        var resourceTypes = {};
        self.$store.getters.activeProject.graphs.forEach(function(graph) {
            resourceTypes[graph.graphid] = graph;
        });
        this.resource_types = resourceTypes;
    }
};
</script>

<style scoped>
    .mapboxgl-map {
        height: 100%;
        border: 1px solid rgb(200, 200, 200);
        box-sizing: border-box;
    }
    ons-progress-circular {
        display: block;
        /* margin: 20% auto; */
    }
    .map-control-templates {
        display: none;
    }
    .popup {
        position: absolute;
        bottom: 5px;
        left: 5px;
        right: 5px;
        height: 205px;
        background-color: #1C2F42;
        border: 1px solid #0E2031;
        color: #fafafa;
        overflow: hidden;
        border-radius: 2px;
        padding: 12px;
        z-index: 100;
    }
    .popup-header {
        display: flex;
        min-height: 40px;
    }
    .popup-content .description {
        font-size: 13px;
        margin-top: 5px;
        line-height: 18px;
        height: 85px;
        overflow-y: scroll;
        color: #ddd;
        background: #2D3C4B;
        padding: 5px;
        border-radius: 2px;
        border: 1px solid #0E2031;
    }
    .popup-close {
        height: 20px;
        width: 20px;
        padding: 5px;
        margin-left: 8px;
        /* background: #2D3C4B;
        border: 1px solid #0E2031;
        border-radius: 50%; */
    }
    @media screen and (max-height: 550px){
        .popup {
            position: absolute;
            top: 0px;
            width: 70%;
            max-height: 90%;
            background-color: white;
            color: dimgrey;
            overflow: hidden;
            padding: 12px;
        }
        .popup-content .description  {
            font-size: 14px;
            line-height: 18px;
            max-height: 100px;
            overflow: hidden
        }
    }
    .resource-model-icon {
        font-size: 14px;
        padding: 10px;
    }
    .icon-circle {
        box-sizing: border-box;
        border: solid 1px #0E2031;
        border-radius: 50%;
        height: 36px;
        width: 36px;
        background: #d7e0f8;
        opacity: .7;
    }
    .resource-model-title {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        padding-left: 5px;
        color: #f4f4f4;
        font-size: 14px;
        width: 80%;
        margin-top: 2px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }
    .resource-model-subtitle {
        font-size: 12px;
        padding-top: 0px;
        margin-top: 2px;
        color: #ddd;
    }
    .edit-button {
        width: 100%;
        margin-top: 10px;
        font-size: 15px;
        text-align: center;
    }
</style>
