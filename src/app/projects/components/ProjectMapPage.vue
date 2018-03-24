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
const mbTilesURL = 'https://github.com/archesproject/arches-mobile/raw/master/static/map/offline_basemap_test.mbtiles';

const staticPath = 'static/map/';
const mbtilesFile = 'mbtiles_download.mbtiles';
const style = {
    version: 8,
    center: [-122.4194, 37.7749],
    zoom: 12,
    sources: {
        openmaptiles: {
            type: 'mbtiles',
            path: mbtilesFile,
            attribution: attribution
        }
    },
    sprite: `${staticPath}styles/klokantech-basic/sprite`,
    glyphs: `${staticPath}fonts/{fontstack}/{range}.pbf`,
    layers: basemapLayers
};

export default {
    name: 'ProjectMap',
    data() {
        return {
            mapId: `project-map-${uuidv4()}`
        };
    },
    mounted() {
        this.mapInit();
    },
    methods: {
        mapInit() {
            this.getDBTargetDir()
                .then(this.downloadBasemaps)
                .then(() => {
                    new mapboxgl.OfflineMap({
                        container: this.mapId,
                        style: style,
                        hash: true
                    }).then((map) => {
                        map.addControl(new mapboxgl.NavigationControl());
                        this.$emit('map-init', map);
                    });
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
        downloadBasemaps(targetDir) {
            return new Promise((resolve, reject) => {
                var uri = encodeURI(mbTilesURL);
                new window.FileTransfer().download(
                    uri, targetDir.toURL() + mbtilesFile, (entry) => {
                        resolve(entry);
                    }, (error) => {
                        reject(error);
                    }, true
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

