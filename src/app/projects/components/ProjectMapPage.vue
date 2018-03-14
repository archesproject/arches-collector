<template>
    <div :id="mapId"></div>
</template>

<script>
import uuidv4 from 'uuid/v4';
import 'mapbox-gl-cordova-offline/www/mapbox-gl.css';
const mapboxgl = window.mapboxgl;

export default {
    name: 'ProjectMap',
    data() {
        return {
            mapId: `mapboxgl-map-${uuidv4()}`
        };
    },
    props: {},
    mounted() {
        this.mapInit();
    },
    methods: {
        mapInit() {
            new mapboxgl.OfflineMap({
                container: this.mapId,
                style: 'static/map/style-offline.json',
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
