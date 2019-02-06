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
            selectedResource: null,
            loading: true,
            resource_types: {},
            onlinebasemap: project.onlinebasemaps ? project.onlinebasemaps.default : 'mapbox://styles/mapbox/satellite-v9'
        };
    },
    methods: {
        closePopup: function() {
            this.selectedResource = null;
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
            return this.$store.dispatch(
                'getProjectResourcesGeoJSON',
                this.project.id
            ).then((resourceGeoJSON) => {
                this.resourceGeoJSON = resourceGeoJSON;
            });
        },
        mapOnlineInit: function() {
            var self = this;
            mapboxgl.accessToken = 'pk.eyJ1IjoiY2hpYXR0IiwiYSI6ImZRLTZDbVkifQ.2ZLLC1kInvxJ7isk_0_OMw';
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
                var resources = JSON.parse(JSON.stringify(self.resourceGeoJSON));
                map.addSource('resources', {type: 'geojson', data: resources});
                self.addResourceMarkers(map);
                self.$emit('map-init', map);
                self.loading = false;
            });
        },
        mapOfflineInit: function() {
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
                    this.addResourceMarkers(map);
                    this.$emit('map-init', map);
                }).catch(error => {
                    console.log('map init error:', error.message);
                }, self);
        },
        getMapConfig: function(offline) {
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
                hash: true
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
        },
        addResourceMarkers: function(map) {
            map.loadImage('static/map/marker.png', (err, img) => {
                if (err) throw err;
                const markerName = 'marker-pin';
                map.addImage(markerName, img);
                map.addLayer({
                    id: 'resource-markers',
                    type: 'symbol',
                    source: 'resources',
                    layout: {
                        'icon-image': markerName,
                        'icon-allow-overlap': true,
                        'icon-offset': [
                            0,
                            -86
                        ],
                        'icon-size': 0.15
                    }
                });
                map.on('click', 'resource-markers', (e) => {
                    const feature = e.features[0];
                    this.selectedResource = feature.properties;
                });
            });
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

        var isOffline = 'onLine' in navigator && !navigator.onLine && window.device;

        var useOfflineMaps = function() {
            var useoffline = false;
            if (self.project.tilecache) {
                if (!self.project.onlinebasemaps) {
                    useoffline = true;
                } else if (self.project.onlinebasemaps && !self.project.onlinebasemaps.default) {
                    useoffline = true;
                }
            }
            return useoffline;
        };

        if (isOffline || useOfflineMaps()) {
            this.setupBasemaps()
                .then(this.getResourceData)
                .then(this.mapOfflineInit)
                .then(() => {
                    this.loading = false;
                }).catch(function(err) {
                    console.log('Unable to initialize offline basemap', err);
                });
        } else {
            self.getResourceData().then(
                self.mapOnlineInit
            );
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
