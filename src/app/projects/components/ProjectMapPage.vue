<template>
    <transition name="slide">
        <page-header-layout>
            <v-ons-page>
                <div class="temp">
                    PROJECT MAP
                </div>
            </v-ons-page>
        </page-header-layout>
    </transition>
</template>

<script>
import mapboxgl from 'mapbox-gl-cordova-mbtiles/www/mapbox-gl-cordova-mbtiles';
import 'mapbox-gl-cordova-mbtiles/www/mapbox-gl.css';

console.log(mapboxgl);

export default {
    name: 'ProjectMap'
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
