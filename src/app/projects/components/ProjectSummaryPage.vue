<template>
    <div>
        <div class="section">
            <div>
                Description
            </div>
            <div class="sub-text" style="padding-top: 5px;">
                {{project.description}}
            </div>  
        </div>   
        <div class="section">
            <div>
                Status
            </div>
            <v-ons-row>
                <v-ons-col style="text-align: right;">
                    <div class="large-text">{{project.lastsync.date}}&nbsp;<span class="sub-text">{{project.lastsync.time}}</span></div>
                    <span class="sub-text">Date/Time of Last Sync</span>
                </v-ons-col>
            </v-ons-row>
            <v-ons-row>
                <v-ons-col style="text-align: right;">
                    <div class="large-text">30</div>
                    <span class="sub-text">Records Edited</span>
                </v-ons-col>
                <v-ons-col style="text-align: right;">
                    <div class="large-text">{{records_to_sync}}</div>
                    <span class="sub-text">Records to Sync</span>
                </v-ons-col>
            </v-ons-row>
        </div>
        <v-ons-row style="margin-top: 35px;">
            <v-ons-col>
                <v-ons-button modifier="medium" :disabled="syncing" class="btn-success" style="width: 160px;" v-on:click="sync">
                    <v-ons-icon v-if="!syncing && !sync_failed" icon="ion-android-sync" class="sync-spinner"></v-ons-icon>
                    <v-ons-icon v-if="sync_failed" icon="ion-android-alert" class="sync-spinner"></v-ons-icon>
                    <v-ons-progress-circular v-if="syncing" indeterminate class="sync-spinner-offset">
                    </v-ons-progress-circular>
                    {{sync_btn_text}}
                </v-ons-button>
            </v-ons-col>
            <v-ons-col>
                <v-ons-button modifier="large outline" class="btn-danger" v-on:click="deleteProject">Forget Project</v-ons-button>
            </v-ons-col>
        </v-ons-row>

        <div>
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
                <div ref="popup">
                    <div class="popup-content">
                        <h4>{{ selectedResource.displayname }}</h4>
                        <hr>
                        <div class="description">
                            {{ selectedResource.displaydescription }}
                        </div>
                    </div>
                </div>
            </div>
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
    name: 'ProjectSummaryPage',
    props: ['project', 'pageActive'],
    data() {
        return {
            syncing: false,
            sync_failed: false,
            mapId: `project-map-${uuidv4()}`,
            bounds: new mapboxgl.LngLatBounds(
                geojsonExtent(
                    this.project.bounds
                )
            ),
            resourceGeoJSON: {
                type: 'FeatureCollection',
                features: []
            },
            selectedResource: {
                id: null,
                displayname: '',
                displaydescription: ''
            },
            loading: true
        };
    },
    computed: {
        sync_btn_text() {
            return (this.syncing ? 'Syncing...' : (this.sync_failed ? 'Sync Failed' : (this.project.lastsync.date === '' ? 'Join Project' : 'Sync Now')));
        },
        records_to_sync() {
            return this.$store.getters.resourcesToSync;
        }
    },
    methods: {
        sync: function() {
            var self = this;
            this.syncing = true;
            this.sync_failed = false;
            this.$store.dispatch('syncRemote', this.project.id)
                .catch(function() {
                    self.sync_failed = true;
                })
                .finally(function(doc) {
                    console.log('syncing done');
                    self.syncing = false;
                });
        },
        deleteProject: function() {},
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
        mapInit: function() {
            return new mapboxgl.OfflineMap(this.getMapConfig())
                .then((map) => {
                    this.setMapExtent(map);
                    map.addControl(new mapboxgl.NavigationControl());
                    this.addResourceMarkers(map);
                    this.$emit('map-init', map);
                });
        },
        getMapConfig: function() {
            return {
                container: this.mapId,
                style: {
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
                },
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
                    const markerHeight = 28;
                    const markerRadius = 12;
                    const linearOffset = 5;
                    const offset = {
                        'top': [0, 0],
                        'top-left': [0, 0],
                        'top-right': [0, 0],
                        'bottom': [0, -markerHeight],
                        'bottom-left': [
                            linearOffset,
                            (markerHeight - markerRadius + linearOffset) * -1
                        ],
                        'bottom-right': [
                            -linearOffset,
                            (markerHeight - markerRadius + linearOffset) * -1
                        ],
                        'left': [
                            markerRadius,
                            (markerHeight - markerRadius) * -1
                        ],
                        'right': [
                            -markerRadius,
                            (markerHeight - markerRadius) * -1
                        ]
                    };
                    const feature = e.features[0];
                    const coords = feature.geometry.coordinates.slice();
                    this.selectedResource = feature.properties;

                    while (Math.abs(e.lngLat.lng - coords[0]) > 180) {
                        coords[0] += e.lngLat.lng > coords[0] ? 360 : -360;
                    }

                    new mapboxgl.Popup({offset: offset})
                        .setLngLat(coords)
                        .setDOMContent(this.$refs.popup)
                        .addTo(map);
                });
            });
        },
        stopPropagation: function(e) {
            e.stopPropagation();
        }
    },
    mounted() {
        var self = this;
        console.log('mounted');
        this.$store.dispatch('getProjectChanges', this.project.id)
            .finally(function(doc) {
                self.changes = doc;
            });

        this.setupBasemaps()
            .then(this.getResourceData)
            .then(this.mapInit)
            .then(() => {
                this.loading = false;
            });
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .sub-text {
        font-size: small;
        color: grey;
    }
    .large-text {
        font-size: 26px;
        color: #4d4b65
    }
    .section {
        border-bottom: solid 1px #c5c5c5; 
        padding: 20px;
    }
    .sync-spinner {
        width: 20px;
        height: 20px;

    }
    .sync-spinner-offset {
        width: 20px;
        height: 20px;
        position: relative;
        left: -5px;
        top: 6px;
    }
    .mapboxgl-map {
        height: 100%;
        border: 1px solid rgb(200, 200, 200);
        box-sizing: border-box;
    }
    ons-progress-circular {
        display: block;
        margin: 20% auto;
    }
    .map-control-templates {
        display: none;
    }
    .popup-content {
        margin: 12px 6px 4px;
        color: dimgrey;
        max-width: 170px;
    }
    .popup-content .description {
        font-size: 0.8em;
        line-height: 1.2em;
        margin: 2px;
    }
</style>
