<template>
    <div :id="mapId"></div>
</template>

<script>
import uuidv4 from 'uuid/v4';
import 'mapbox-gl-cordova-offline/www/mapbox-gl.css';
import basemapLayers from '../../../assets/map/basemap_layers.json';
const mapboxgl = window.mapboxgl;
const staticPath = 'static/map/';
const osmAttr = '<a href="http://www.openmaptiles.org/" target="_blank">' +
    '&copy; OpenMapTiles</a> <a href="http://www.openstreetmap.org/about/" ' +
    'target="_blank">&copy; OpenStreetMap contributors</a>';

export default {
    name: 'ProjectMap',
    data() {
        return {
            mapId: `mapboxgl-map-${uuidv4()}`,
            mbtilesFile: 'offline_basemap_test.mbtiles',
            center: [-122.4194, 37.7749],
            zoom: 12
        };
    },
    mounted() {
        this.mapInit();
    },
    methods: {
        mapInit() {
            new mapboxgl.OfflineMap({
                container: this.mapId,
                style: {
                    version: 8,
                    center: this.center,
                    zoom: this.zoom,
                    sources: {
                        openmaptiles: {
                            type: 'mbtiles',
                            path: `${staticPath + this.mbtilesFile}`,
                            attribution: osmAttr
                        }
                    },
                    sprite: `${staticPath}styles/klokantech-basic/sprite`,
                    glyphs: `${staticPath}fonts/{fontstack}/{range}.pbf`,
                    layers: basemapLayers
                },
                hash: true
            }).then((map) => {
                map.addControl(new mapboxgl.NavigationControl());
                this.$emit('map-init', map);
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
