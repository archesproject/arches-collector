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
import basemapLayers from '../../../assets/map/basemap_layers.json';

const mapboxgl = window.mapboxgl;
const attribution = '<a href="http://www.openmaptiles.org/" target="_blank">' +
    '&copy; OpenMapTiles</a> <a href="http://www.openstreetmap.org/about/" ' +
    'target="_blank">&copy; OpenStreetMap contributors</a>';
const staticPath = 'static/map/';

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
            const platform = window.device.platform;
            const file = window.cordova.file;
            const resolveLocalFileSystemURL = window.resolveLocalFileSystemURL;
            return new Promise((resolve, reject) => {
                if (platform === 'Android') {
                    return resolveLocalFileSystemURL(
                        file.applicationStorageDirectory,
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
                } else if (platform === 'iOS') {
                    return resolveLocalFileSystemURL(
                        file.documentsDirectory,
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
            // TODO: add project resource instance data to map as markers
            // TODO: pull basemap layer styles from project?
            return new mapboxgl.OfflineMap({
                container: this.mapId,
                style: {
                    version: 8,
                    sources: {
                        openmaptiles: {
                            type: 'mbtiles',
                            path: this.mbtilesFile,
                            attribution: attribution
                        }
                    },
                    sprite: `${staticPath}styles/klokantech-basic/sprite`,
                    glyphs: `${staticPath}fonts/{fontstack}/{range}.pbf`,
                    layers: basemapLayers
                },
                hash: true
            }).then((map) => {
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
                this.$emit('map-init', map);
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
