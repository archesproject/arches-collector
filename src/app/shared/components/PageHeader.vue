<template>

    <v-ons-toolbar class="app-header-toolbar">
        <div class="left">
            <v-ons-toolbar-button class="left-button-offset">
                <img src="../../../assets/img/arches_logo_light.png" width="20"></img>
                <span v-if="$route.name === 'serverlist' || $route.name === 'projectlist'" class="left-button-text" @click="goTo('serverlist');">
                    Arches Apps
                </span>
                <span v-if="$route.name !== 'serverlist'">
                    <span class="app-path-divider" v-if="$route.name === 'projectlist'">
                        /
                    </span>
                    <span class="left-button-text" @click="goTo('projectlist');">
                        {{active_server_name}}
                    </span>
                </span>
                <span class="app-path-divider" v-if="$route.name !== 'serverlist' && $route.name !== 'projectlist'">
                    /
                    <span class="left-button-text" @click="goToProject();">
                        {{active_project_name}}
                    </span>
                </span>
            </v-ons-toolbar-button>
        </div>
        <div class="center"></div>
        <div class="right">
            <v-ons-toolbar-button class="app-right-button">
                <v-ons-icon icon="ion-easel"></v-ons-icon>
            </v-ons-toolbar-button>
        </div>
    </v-ons-toolbar>
</template>

<script>
export default {
    name: 'PageHeader',
    computed: {
        active_server_name() {
            return this.$store.getters.activeServer ? this.$store.getters.activeServer.nickname : '';
        },
        active_project_name() {
            return this.$store.getters.activeProject ? this.$store.getters.activeProject.name : '';
        }

    },
    methods: {
        toggleOpen: function() {
            this.$emit('toggle-open-evt');
        },
        goTo: function(name) {
            this.$router.push({'name': name});
        },
        goToProject: function() {
            this.$router.push({'name': 'project', params: {project: this.$store.getters.activeProject, tabIndex: this.$store.getters.activeServer.card_nav_stack[0].tabIndex}});
        },
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.app-header-toolbar {
    background: #A10408;
    color: #fff;
}

.app-path-divider {
    color: #fff;
    font-size: 17px;
}

.left-button-text{
    position: relative;
    top: -3px;
    font-size: 17px;
    color: #fff;
}

.left-button-offset{
    padding-top: 17px;
}

.toolbar-button--material{
    color: dimgrey;
}

.app-right-button {
    color: #fff;
}

</style>
