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
const mbtilesFile = 'test_mb_tiles_download_1.mbtiles';
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
        getDBTargetDir() {
            return new Promise(function(resolve, reject) {
                if (window.device.platform === 'Android') {
                    return window.resolveLocalFileSystemURL(window.cordova.file.applicationStorageDirectory, function(dir) {
                        dir.getDirectory('databases', {create: true}, function(subdir) {
                            resolve(subdir);
                        });
                    }, reject);
                } else if (window.device.platform === 'iOS') {
                    return window.resolveLocalFileSystemURL(window.cordova.file.documentsDirectory, resolve, reject);
                } else {
                    reject(new Error('Platform not supported'));
                };
            });
        },
        downloadBasemaps() {
            var self = this;
            this.getDBTargetDir().then(function(targetDir) {
                console.log(targetDir);
                var fileTransfer = new window.FileTransfer();
                var uri = window.encodeURI('http://localhost:8000/media/data/mobile_basemap_test.mbtiles');

                fileTransfer.download(
                    uri, targetDir.toURL() + mbtilesFile, function(entry) {
                        new mapboxgl.OfflineMap({
                            container: self.mapId,
                            style: style,
                            hash: true
                        }).then((map) => {
                            map.addControl(new mapboxgl.NavigationControl());
                            self.$emit('map-init', map);
                        });
                    },
                    function(error) {
                        console.log('download error source ' + error.source);
                        console.log('download error target ' + error.target);
                        console.log('download error code' + error.code);
                    },
                    true
                );
            });
        },
        mapInit() {
            this.downloadBasemaps();
            // new mapboxgl.OfflineMap({
            //     container: this.mapId,
            //     style: style,
            //     hash: true
            // }).then((map) => {
            //     map.addControl(new mapboxgl.NavigationControl());
            //     this.$emit('map-init', map);
            // });
        }
    }
};
</script>

<style scoped>
.mapboxgl-map {
    height: 100%;
}
</style>

