<template>
    <div :id="mapId"></div>
</template>

<script>
import uuidv4 from 'uuid/v4';
import 'mapbox-gl-cordova-offline/www/mapbox-gl.css';
import basemapLayers from '../../../assets/map/basemap_layers.json';
const mapboxgl = window.mapboxgl;

export default {
    name: 'ProjectMap',
    data() {
        return {
            mapId: `mapboxgl-map-${uuidv4()}`
        };
    },
    mounted() {
        this.mapInit();
    },
    methods: {
        mapInit() {
            const osmAttr = '<a href="http://www.openmaptiles.org/" ' +
                'target="_blank">&copy; OpenMapTiles</a> ' +
                '<a href="http://www.openstreetmap.org/about/" target="_blank">' +
                '&copy; OpenStreetMap contributors</a>';
            new mapboxgl.OfflineMap({
                container: this.mapId,
                style: {
                    'version': 8,
                    'center': [-122.4194, 37.7749],
                    'zoom': 12,
                    'bearing': 0,
                    'pitch': 0,
                    'sources': {
                        'openmaptiles': {
                            'type': 'mbtiles',
                            'path': 'static/map/offline_basemap_test.mbtiles',
                            'attribution': osmAttr
                        }
                    },
                    'sprite': 'static/map/styles/klokantech-basic/sprite',
                    'glyphs': 'static/map/fonts/{fontstack}/{range}.pbf',
                    'layers': basemapLayers
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
