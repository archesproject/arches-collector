<template>
    <transition name="slide">
        <v-ons-page>
            <div class="temp">
                SERVER MANAGER SCREEN
                <br>
                https://github.com/archesproject/arches-mobile/issues/3
                <br>
                https://github.com/archesproject/arches-mobile/issues/4
                <br>
                maybe we can use `a v-ons-navigator` to achieve this?
                <h4 style="color:black;">
                    <router-link :to="{ name: 'projectlist' }">Next</router-link>
                </h4>
            </div>
        </v-ons-page>
    </transition>
</template>

<script>
export default {
    name: 'ServerManager',
    // props: ['deviceready'],
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
