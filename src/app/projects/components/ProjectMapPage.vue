<template>
    <div :id="mapId"></div>
</template>

<script>
import mapboxgl from 'mapbox-gl-cordova-mbtiles/www/mapbox-gl-cordova-mbtiles';
import 'mapbox-gl-cordova-mbtiles/www/mapbox-gl.css';
import uuidv4 from 'uuid/v4';

const storage = window.localStorage;
let token = storage.getItem('mapboxglAccessToken');
if (!token) {
    console.warn('WARNING: Mapboxgl access token not found. \n Try running ' +
        'the following from the console with your token:\n' +
        'window.localStorage.setItem("mapboxglAccessToken", "{your token here}");');
}
mapboxgl.accessToken = token;

export default {
    name: 'ProjectMap',
    data() {
        return {
            mapId: `mapboxgl-map-${uuidv4()}`,
            mapInstance: null
        };
    },
    mounted() {
        const map = new mapboxgl.Map({
            container: this.mapId,
            // TODO: replace w/ style pulled from arches server
            style: 'mapbox://styles/mapbox/streets-v9',
            // TODO: set to project extent
            center: [-74.50, 40],
            zoom: 9
        });
        map.on('load', () => {
            this.mapInstance = map;
            this.$emit('map-init', map);
        });
    },
    beforeDestroy() {
        if (this.mapInstance) {
            this.mapInstance.remove();
        }
    }
};
</script>

<style scoped>
.mapboxgl-map {
    height: 100%;
}
</style>
