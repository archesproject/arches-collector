<template>
    <v-ons-page>
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
                    Name: {{ selectedResource.displayname }}
                </div>
            </div>
        </div>
    </v-ons-page>
</template>

<script>
import geojsonExtent from '@mapbox/geojson-extent';
import parseWKT from 'wellknown';
import uuidv4 from 'uuid/v4';
import 'mapbox-gl-cordova-offline/www/mapbox-gl.css';
// TODO: pull basemap layer styles from project?
import basemapLayers from '../../../assets/map/basemap_layers.json';

const mapboxgl = window.mapboxgl;

export default {
    name: 'ProjectMap',
    props: ['project'],
    data() {
        return {
            mapId: `project-map-${uuidv4()}`,
            mbtilesFile: `${this.project.id}.mbtiles`,
            tileCacheURI: encodeURI(this.project.tilecache),
            bounds: new mapboxgl.LngLatBounds(
                geojsonExtent(
                    parseWKT(this.project.bounds)
                )
            ),
            resourceGeoJSON: {
                type: 'FeatureCollection',
                features: []
            },
            selectedResource: {
                id: null,
                displayname: ''
            },
            loading: true
        };
    },
    mounted() {
        this.setupDB()
            .then(this.getResourceData)
            .then(this.mapInit)
            .then(() => {
                this.loading = false;
            });
    },
    methods: {
        setupDB() {
            return this.getDBTarget().then((target) => {
                return this.checkDB(target).catch(() => {
                    return this.downloadDB(target);
                });
            });
        },
        getDBTarget() {
            return new Promise((resolve, reject) => {
                if (window.device.platform === 'Android') {
                    return window.resolveLocalFileSystemURL(
                        window.cordova.file.applicationStorageDirectory,
                        (dir) => {
                            dir.getDirectory(
                                'databases',
                                {create: true},
                                (subdir) => {
                                    resolve(subdir);
                                }
                            );
                        },
                        reject
                    );
                } else if (window.device.platform === 'iOS') {
                    return window.resolveLocalFileSystemURL(
                        window.cordova.file.documentsDirectory,
                        resolve,
                        reject
                    );
                } else {
                    reject(new Error('Platform not supported'));
                };
            });
        },
        checkDB(target) {
            return new Promise((resolve, reject) => {
                target.getFile(this.mbtilesFile, {}, resolve, reject);
            });
        },
        downloadDB(target) {
            return new Promise((resolve, reject) => {
                new window.FileTransfer().download(
                    this.tileCacheURI,
                    target.toURL() + this.mbtilesFile,
                    (entry) => {
                        resolve(entry);
                    },
                    (error) => {
                        reject(error);
                    },
                    true
                );
            });
        },
        getResourceData() {
            return this.$store.dispatch('getProjectResourcesGeoJSON', this.project.id)
                .then((resourceGeoJSON) => {
                    this.resourceGeoJSON = resourceGeoJSON;
                });
        },
        mapInit() {
            return new mapboxgl.OfflineMap(this.getMapConfig())
                .then((map) => {
                    this.setMapExtent(map);
                    map.addControl(new mapboxgl.NavigationControl());
                    this.addResourceMarkers(map);
                    this.$emit('map-init', map);
                });
        },
        getMapConfig() {
            return {
                container: this.mapId,
                style: {
                    version: 8,
                    sources: {
                        openmaptiles: {
                            type: 'mbtiles',
                            path: this.mbtilesFile,
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
        setMapExtent(map) {
            const tr = map.transform;
            const nw = tr.project(this.bounds.getNorthWest());
            const se = tr.project(this.bounds.getSouthEast());
            const size = se.sub(nw);
            const scaleX = (tr.width - 80) / size.x;
            const scaleY = (tr.height - 80) / size.y;
            const jumpInfo = {
                center: tr.unproject(nw.add(se).div(2)),
                zoom: tr.scaleZoom(tr.scale * Math.min(scaleX, scaleY))
            };
            console.log(jumpInfo);
            map.jumpTo(jumpInfo);
        },
        addResourceMarkers(map) {
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
                    const markerHeight = 23;
                    const markerRadius = 10;
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
        stopPropagation(e) {
            e.stopPropagation();
        }
    }
};
</script>

<style scoped>
.mapboxgl-map {
    height: 100%;
}
ons-progress-circular {
    display: block;
    margin: 50% auto;
}
.map-control-templates {
    display: none;
}
popup-content {
    margin: 12px 6px 4px;
    font-size: 1.2em;
    color: dimgrey;
}
</style>
