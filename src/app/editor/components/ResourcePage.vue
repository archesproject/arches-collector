<template>
    <page-header-layout>
        <v-ons-page>
            <v-ons-toolbar style="background-color: whitesmoke;">
                <div class="left">
                    <v-ons-toolbar-button class="flex">
                        <v-ons-icon class="text-color-dark resource-header" icon="ion-android-arrow-dropleft-circle" @click="back"></v-ons-icon>
                        <span v-if="headerName.label">
                            <span style="display: flex; flex-direction: column; line-height: 22px; padding-top: 6px; padding-left: 8px;"  class="flex text-color-dark resource-header">
                                <span class="flex">
                                    {{headerName.value}}<br>{{headerName.label}}
                                </span>
                            </span>
                        </span>
                        <span v-else>
                            <span style="padding-left: 8px;" class="text-color-dark resource-header">{{headerName.value}}</span>
                        </span>
                        <!-- <span class="text-color-dark resource-header">{{headerName}}</span> -->


                        <!-- <span style="display: flex; flex-direction: column; line-height: 22px;
    padding-top: 6px;" class="text-color-dark resource-header">
                            <span style="display: flex">
                                {{headerName.value}}<br>{{headerName.label}}
                            </span>
                        </span>   -->

                    </v-ons-toolbar-button>
                </div>
                <div class="center">

                </div>
                <div class="right">
                    <transition name="fade">
                        <span class="saving-popup" v-show="saving">saving...</span>
                    </transition>
                    <v-ons-toolbar-button @click="toggleSideNav">
                        <v-ons-icon class="text-color-dark project-name" icon="md-home"></v-ons-icon>
                    </v-ons-toolbar-button>
                </div>
            </v-ons-toolbar>
            <v-ons-splitter>
                <v-ons-splitter-side width="80%"
                    swipeable collapse="" side="right"
                    :open.sync="showSideNav" class="sidenav toolbar-header">
                    <v-ons-page>
                        <v-ons-list>
                            <v-ons-list-item tappable @click="createNewRecord">
                                <div class="fa5 fa-plus-circle text-color-dark"></div>
                                <span class="text-color-dark label right-panel-label">New {{this.$store.getters.activeGraph.name}}
                                    <div class="text-color-light subtitle-font-size">Create a new record</div>
                                </span>
                            </v-ons-list-item>
                            <v-ons-list-item tappable @click="showResourceList">
                                <div class="fa5 fa-edit text-color-dark"></div>
                                <span class="text-color-dark label right-panel-label">Edit an Existing Resource
                                    <div class="text-color-light subtitle-font-size">Select an existing resource and update</div>
                                </span>
                            </v-ons-list-item>
                            <v-ons-list-item tappable @click="showResourceModels">
                                <div class="fa5 fa-external-link-alt text-color-dark"></div>
                                <span class="text-color-dark label right-panel-label">Select a New Resource Model
                                    <div class="text-color-light subtitle-font-size">Pick a model and create a new resource</div>
                                </span>
                            </v-ons-list-item>
                            <v-ons-list-item tappable @click="showProjectMap">
                                <div class="fa5 fa-map-marker-alt text-color-dark"></div>
                                <span class="text-color-dark label right-panel-label">Project Map
                                    <div class="text-color-light subtitle-font-size">View the location of resources</div>
                                </span>
                            </v-ons-list-item>
                            <v-ons-list-item tappable @click="selectProject">
                                <div class="fa5 fa-exchange-alt text-color-dark"></div>
                                <span class="text-color-dark label right-panel-label">Jump to a Different Project
                                    <div class="text-color-light subtitle-font-size">Work with resources in another project</div>
                                </span>
                            </v-ons-list-item>
                        </v-ons-list>
                    </v-ons-page>
                </v-ons-splitter-side>
                <v-ons-splitter-content>
                    <v-ons-tabbar swipeable animation="none" :index.sync="activeindex">
                      <template slot="pages">
                          <resource-report-page :project="project" :activeindex="activeindex" v-on:switch-tabs="updateActiveIndex"></resource-report-page>
                          <resource-edit-page v-on:saving="saving = $event" :goBack="goBack"  ref="resource_edit_page"/>
                      </template>
                          <v-ons-tab v-for="(tab, i) in tabs"
                            :icon="tabs[i].icon"
                            :label="tabs[i].label"
                            :badge="tabs[i].badge">
                          </v-ons-tab>
                    </v-ons-tabbar>
                </v-ons-splitter-content>
            </v-ons-splitter>
        </v-ons-page>
    </page-header-layout>
</template>
<script>
export default {
    name: 'ResourcePage',
    props: ['nodegroupid', 'tabIndex'],
    data() {
        return {
            showSideNav: false,
            goBack: false,
            activeindex: this.tabIndex,
            saving: false,
            project: this.$store.getters.activeProject,
            tabs: [
                {
                    icon: 'fa-file-alt',
                    label: 'Resource Report',
                    key: 'ResourceReportPage'
                },
                {
                    icon: 'fa-check',
                    label: 'Editor',
                    key: 'ResourceEditPage'
                }
            ]
        };
    },
    computed: {
        currentNavItem: function() {
            if (!!this.$store.getters.activeServer) {
                return this.$store.getters.activeServer.card_nav_stack[0];
            }
        },
        headerName: function() {
            var navItem = this.currentNavItem;
            if (!!navItem && !!navItem.card) {
                if(navItem.showForm || navItem.activeObject === 'card') {
                    return {'value': navItem.card.name, 'label': ''};
                }
                if(!!navItem.tile) {
                    var x = this.$refs.resource_edit_page.getTileData(navItem.tile,navItem.card);
                    return x;
                }
                return {'value': navItem.card.name, 'label': ''};
            } else {
                return {'value': this.$store.getters.activeGraph.name, 'label': ''}
            }
        }
    },
    methods: {
        back: function() {
            this.goBack = !this.goBack;
        },
        updateActiveIndex: function(event) {
            this.activeindex = event;
        },
        toggleSideNav: function() {
            this.showSideNav = !this.showSideNav;
        },
        createNewRecord: function(e) {
            this.$store.commit('clearActiveResourceInstance');
            this.$store.getters.activeServer.card_nav_stack = [];
            this.$store.getters.activeServer.card_nav_stack.unshift({card: null, tile: null, showForm: false, activeObject: 'tile', 'tabIndex': this.tabIndex});
            this.nodegroupid = null;
            this.tabIndex = 0;
            this.toggleSideNav();
        },
        jumpToProjectPage: function(tabIndex) {
            this.$store.commit('clearActiveResourceInstance');
            this.$store.getters.activeServer.card_nav_stack = [];
            var payload = {
                project_id: this.project.id
            };
            this.$store.commit('setActiveProject', payload);
            this.$router.push({'name': 'project', params: {project: this.project, tabIndex: tabIndex}});
        },
        showResourceModels: function(e) {
           this.jumpToProjectPage(0);
        },
        showResourceList: function(e) {
            this.jumpToProjectPage(1);
        },
        showProjectMap: function(e) {
            this.jumpToProjectPage(2);
        },
        selectProject: function(e) {
            this.$store.commit('clearActiveResourceInstance');
            this.$router.push({
                'name': 'projectlist'
            });
        }
    },
    created: function() {
        if (!!this.$store.getters.activeServer) {
            this.$store.getters.activeServer.card_nav_stack = [];
            this.$store.getters.activeServer.card_nav_stack.unshift({card: null, tile: null, showForm: false, activeObject: 'tile', 'tabIndex': this.tabIndex});
        }
    }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.resource-header {
    font-size: 18px;
}

.saving-popup {
    vertical-align: top;
    font-size: 16px;
    color: #359a35;
}

.sidenav .label{
    padding-left: 10px;
}

.fade-enter-active,
.fade-leave-active {
    -webkit-transition-timing-function: ease;
    transition-timing-function: ease;
    -webkit-transition: opacity .5s;
    transition: opacity .5s;
}

.fade-enter,
.fade-leave-to
/* .fade-leave-active below version 2.1.8 */
{
    opacity: 0;
}

.fade-enter-to,
.fade-leave
/* .fade-leave-active below version 2.1.8 */
{
    opacity: 1;
}

.flex {
    display: flex;
}
</style>
