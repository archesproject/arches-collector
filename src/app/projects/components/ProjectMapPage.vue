<template>
    <v-ons-page>
        <ons-progress-circular indeterminate v-if="loading">
        </ons-progress-circular>
        <div :id="mapId" v-on:touchstart="stopPropagation"></div>
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
            // TODO: pull resource data from project
            resourceGeoJSON: {
                type: 'FeatureCollection',
                features: [{
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [-122.414, 37.776]
                    },
                    properties: {
                        id: 'blahid',
                        display_name: 'Blah'
                    }
                }]
            },
            loading: true
        };
    },
    mounted() {
        this.setupDB()
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
        mapInit() {
            return new mapboxgl.OfflineMap(this.getMapConfig())
                .then((map) => {
                    this.setupMap(map);
                    this.$emit('map-init', map);
                });
        },
        getMapConfig() {
            const attribution = '<a href="http://www.openmaptiles.org/" ' +
                'target="_blank">&copy; OpenMapTiles</a> ' +
                '<a href="http://www.openstreetmap.org/about/" ' +
                'target="_blank">&copy; OpenStreetMap contributors</a>';
            return {
                container: this.mapId,
                style: {
                    version: 8,
                    sources: {
                        openmaptiles: {
                            type: 'mbtiles',
                            path: this.mbtilesFile,
                            attribution: attribution
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
        setupMap(map) {
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
            map.addControl(new mapboxgl.NavigationControl());
            map.loadImage('static/map/marker.png', function(error, image) {
                if (error) throw error;
                map.addImage('marker-pin', image);
                map.addLayer({
                    id: 'points',
                    type: 'symbol',
                    source: 'resources',
                    layout: {
                        'icon-image': 'marker-pin',
                        'icon-allow-overlap': true,
                        'icon-offset': [
                            1,
                            -86
                        ],
                        'icon-size': 0.15
                    }
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
</style>
