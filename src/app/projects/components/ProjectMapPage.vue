<template>
    <div :id="mapId"></div>
</template>

<script>
import mapboxgl from 'mapbox-gl-cordova-offline/www/mapbox-gl-cordova-offline';
import 'mapbox-gl-cordova-offline/www/mapbox-gl.css';
import uuidv4 from 'uuid/v4';

export default {
    name: 'ProjectMap',
    data() {
        return {
            mapId: `mapboxgl-map-${uuidv4()}`,
            mapInstance: null
        };
    },
    mounted() {
        new mapboxgl.OfflineMap({
            container: this.mapId,
            style: 'static/map/style-offline.json'
        }).then((map) => {
            map.addControl(new mapboxgl.NavigationControl());
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
