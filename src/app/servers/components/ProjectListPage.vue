<template>
    <transition name="slide">
        <v-ons-page>
            <page-header active-server="test"></page-header>
            <div class="temp">
                PROJECT LIST SCREEN<br>
                https://github.com/archesproject/arches-mobile/issues/5
            </div>
        </v-ons-page>
    </transition>
</template>

<script>
export default {
    name: 'ProjectList',
    // props: ['deviceready'],
    // data: function(){
    //     return {

    //     }
    // },
    computed: {
        active_server() {
            return this.$store.state.cordova.deviceready;
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


</style>
