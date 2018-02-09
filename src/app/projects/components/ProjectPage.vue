<template>
    <transition name="slide">
        <v-ons-page>
            <div class="temp">
                PROJECT SCREENS {{id}}<br>
                https://github.com/archesproject/arches-mobile/issues/6<br>
                https://github.com/archesproject/arches-mobile/issues/7<br>
                https://github.com/archesproject/arches-mobile/issues/8<br>
            </div>
        </v-ons-page>
    </transition>
</template>

<script>
export default {
    name: 'Project',
    props: ['id'],
    // data: function(){
    //     return {

    //     }
    // },
    // computed: {
    //   deviceready() {
    //     return this.$store.state.cordova.deviceready;
    //   }
    // },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


</style>
