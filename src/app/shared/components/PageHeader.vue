<template>

    <v-ons-toolbar class="app-header-toolbar">
        <div class="left">
            <v-ons-toolbar-button class="left-button-offset">
                <div class="nav-header">
                <img src="../../../assets/img/arches_logo_light.png" style="padding-right: 5px;" height="25" @click="goTo('serverlist');"></img>
                <div v-if="$route.name === 'serverlist' || $route.name === 'projectlist'" @click="goTo('serverlist');">
                    Arches Apps
                </div>
                <div class="app-path-divider" v-if="$route.name !== 'serverlist'">
                    <div v-if="$route.name === 'projectlist'">
                        /
                    </div>
                    <div @click="goTo('projectlist');">
                        {{active_server_name}}
                    </div>
                </div>
                <div class="app-path-divider" v-if="$route.name !== 'serverlist' && $route.name !== 'projectlist'">
                    <div>
                        /
                    </div>
                    <div class="left-button-text" @click="goToProject();">
                        {{active_project_name}}
                    </div>
                </div>
            </div>
            </v-ons-toolbar-button>
        </div>
        <div class="center"></div>
        <div class="right">
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
    display: inherit;
}

.left-button-text {
    width: 190%;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}

.nav-header {
    display: inline-flex;
    height: 25px;
    align-items: center;
    padding-top: 14px;
    color: #fff;
    font-size: 17px;
}

.left-button-offset {
    padding-top: 17px;
}

.left-button-offset.toolbar-button--material {
    padding-top: 0px;
}

.toolbar-button--material {
    color: dimgrey;
}

.app-right-button {
    color: #fff;
}

</style>
