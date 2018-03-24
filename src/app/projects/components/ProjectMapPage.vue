<template>
    <div :id="mapId"></div>
</template>

<script>
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
            tileCacheURI: encodeURI(this.project.tilecache)
        };
    },
    mounted() {
        this.mapInit();
    },
    methods: {
        mapInit() {
            // TODO: add loading indicator during map init...
            this.getDBTargetDir()
                .then(this.checkForDatabase)
                .then(() => {
                    return new mapboxgl.OfflineMap({
                        container: this.mapId,
                        style: {
                            version: 8,
                            center: [-122.4194, 37.7749],
                            zoom: 12,
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
                    });
                })
                .then((map) => {
                    map.addControl(new mapboxgl.NavigationControl());
                    this.$emit('map-init', map);
                });
        },
        getDBTargetDir() {
            const platform = window.device.platform;
            const file = window.cordova.file;
            const resolveLocalFileSystemURL = window.resolveLocalFileSystemURL;
            return new Promise((resolve, reject) => {
                if (platform === 'Android') {
                    return resolveLocalFileSystemURL(file.applicationStorageDirectory, (dir) => {
                        dir.getDirectory('databases', {create: true}, (subdir) => {
                            resolve(subdir);
                        });
                    }, reject);
                } else if (platform === 'iOS') {
                    return resolveLocalFileSystemURL(file.documentsDirectory, resolve, reject);
                } else {
                    reject(new Error('Platform not supported'));
                };
            });
        },
        checkForDatabase(targetDir) {
            return new Promise((resolve, reject) => {
                targetDir.getFile(this.mbtilesFile, {}, resolve, reject);
            }).catch(() => {
                return this.downloadBasemaps(targetDir);
            });
        },
        downloadBasemaps(targetDir) {
            return new Promise((resolve, reject) => {
                new window.FileTransfer().download(
                    this.tileCacheURI,
                    targetDir.toURL() + this.mbtilesFile,
                    (entry) => {
                        resolve(entry);
                    },
                    (error) => {
                        reject(error);
                    },
                    true
                );
            });
        }
    }
};
</script>

<style scoped>
.mapboxgl-map {
    height: 100%;
}
</style>

