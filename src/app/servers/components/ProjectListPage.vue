<template>
    <transition name="slide">
        <v-ons-page>
            <page-header :active-server="active_server_name"></page-header>
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
    computed: {
        active_server_name() {
            return this.$store.getters.activeServer ? this.$store.getters.activeServer.nickname : '';
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


</style>
