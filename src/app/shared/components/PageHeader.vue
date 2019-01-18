<template>
    <v-ons-toolbar>
        <div class="left">
            <v-ons-toolbar-button class="left-button-offset">
                <img src="../../../assets/img/favicon.png" width="20"></img>
                <span v-if="$route.name === 'serverlist' || $route.name === 'projectlist'" class="left-button-text" @click="goTo('serverlist');">
                    Arches Applications
                </span>
                <span v-if="$route.name !== 'serverlist'"> 
                    <span v-if="$route.name === 'projectlist'">     
                        / 
                    </span>
                    <span class="left-button-text" @click="goTo('projectlist');">
                        {{active_server_name}}
                    </span>
                </span>
                <span v-if="$route.name !== 'serverlist' && $route.name !== 'projectlist'"> 
                    / 
                    <span class="left-button-text" @click="goToProject();">
                        {{active_project_name}}
                    </span>
                </span>

            </v-ons-toolbar-button>
        </div>
        <div class="center"></div>
        <div class="right">
            <v-ons-toolbar-button>
                <v-ons-icon icon="ion-ios-search-strong"></v-ons-icon>
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

.left-button-text{
    position: relative;
    top: -3px;
    font-size: 19px;
}

.left-button-offset{
    padding-top:2px;
}

.toolbar-button--material{
    color: dimgrey;
}

</style>
