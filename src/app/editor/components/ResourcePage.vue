<template>
    <page-header-layout>
        <v-ons-page>
            <v-ons-toolbar class="instance-editor-header relative">
                <div class="flex" style="width: 90%;">
                    <div class="instance-editor-back-btn">
                        <v-ons-icon class="resource-header instance-editor-back-icon" style="" icon="ion-arrow-left-b" @click="back"></v-ons-icon>
                    </div>
                    <div v-if="!!headerName.label" class="instance-name-position">
                        <div class="instance-name">{{headerName.label}}
                            <div class="resource-type">{{headerName.value}}</div>
                        </div>
                    </div>
                    <div v-else class="instance-name-position">
                        <div class="instance-name">
                            <div class="resource-type">{{headerName.value}}</div>
                        </div>
                    </div>
                    <transition name="fade">
                        <span class="saving-popup" v-show="saving">Saving...</span>
                    </transition>
                    <div class="instance-tool-btn">
                        <v-ons-toolbar-button @click="toggleSideNav">
                            <v-ons-icon class="instance-editor-toolpanel-btn" icon="fa-bars"></v-ons-icon>
                        </v-ons-toolbar-button>
                    </div>
                </div>
            </v-ons-toolbar>
            <v-ons-splitter>
                <v-ons-splitter-side width="325px"
                    swipeable collapse="" side="right"
                    :open.sync="showSideNav" class="sidenav toolbar-header">
                    <v-ons-page>
                        <v-ons-list>
                            <v-ons-list-item tappable @click="createNewRecord">
                                <div class="fa5 fa-plus-circle text-color-dark"></div>
                                <span class="text-color-dark label right-panel-label">New {{this.$store.getters.activeGraph.name}}
                                    <div class="subtitle-text-color subtitle-font-size">Create a new resource</div>
                                </span>
                            </v-ons-list-item>
                            <v-ons-list-item tappable @click="showResourceList">
                                <div class="fa5 fa-edit text-color-dark"></div>
                                <span class="text-color-dark label right-panel-label">Edit an Existing Resource
                                    <div class="subtitle-text-color subtitle-font-size">Select an existing resource and update</div>
                                </span>
                            </v-ons-list-item>
                            <v-ons-list-item tappable @click="showResourceModels">
                                <div class="fa5 fa-external-link-alt text-color-dark"></div>
                                <span class="text-color-dark label right-panel-label">Select a Different Resource Type
                                    <div class="subtitle-text-color subtitle-font-size">Create a new resource</div>
                                </span>
                            </v-ons-list-item>
                            <v-ons-list-item tappable @click="showProjectMap">
                                <div class="fa5 fa-map-marker-alt text-color-dark"></div>
                                <span class="text-color-dark label right-panel-label">Project Map
                                    <div class="subtitle-text-color subtitle-font-size">View the location of resources</div>
                                </span>
                            </v-ons-list-item>
                            <v-ons-list-item tappable @click="selectProject">
                                <div class="fa5 fa-exchange-alt text-color-dark"></div>
                                <span class="text-color-dark label right-panel-label">Jump to a Different Project
                                    <div class="subtitle-text-color subtitle-font-size">Work with resources in another project</div>
                                </span>
                            </v-ons-list-item>
                        </v-ons-list>
                    </v-ons-page>
                </v-ons-splitter-side>
                <v-ons-splitter-content>
                    <v-ons-tabbar swipeable animation="none" :index.sync="activeindex">
                      <template slot="pages">
                          <resource-report-page :resourceid="resourceid" :tiles="tiles" :project="project" :activeindex="activeindex" v-on:switch-tabs="updateActiveIndex"></resource-report-page>
                          <resource-edit-page v-on:saving="saving = $event" :tiles="tiles" :goBack="goBack" :activeindex="activeindex" v-on:switch-tabs="updateActiveIndex"/>
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
            var displayname = this.resourceid ? this.$store.getters.activeServer.active_resource.displayname : 'Unnamed Resource';
            if (!!navItem && !!navItem.card) {
                return { value: navItem.card.name, label: displayname };
            } else {
                return { value: this.$store.getters.activeGraph.name, label: displayname };
            }
        },
        resourceid: {
            get: function() {
                if (!!this.$store.getters.activeServer && this.$store.getters.activeServer.active_resource) {
                    return this.$store.getters.activeServer.active_resource.resourceinstanceid;
                } else {
                    return null;
                }
            }
        },
        tiles: {
            get: function() {
                if (!!this.resourceid) {
                    return this.$underscore.filter(this.$store.getters.tiles, function(tile) {
                        return tile.resourceinstance_id === this.resourceid;
                    }, this);
                } else {
                    return [];
                }
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
            this.$store.getters.activeServer.card_nav_stack.unshift({ card: null, tile: null, showForm: false, activeObject: 'tile', tabIndex: this.tabIndex });
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
            this.$router.push({ name: 'project', params: { project: this.project, tabIndex: tabIndex } });
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
                name: 'projectlist'
            });
        }
    },
    created: function() {
        if (!!this.$store.getters.activeServer) {
            this.$store.getters.activeServer.card_nav_stack = [];
            this.$store.getters.activeServer.card_nav_stack.unshift({ card: null, tile: null, showForm: false, activeObject: 'tile', tabIndex: this.tabIndex });
        }
    }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.instance-name-position {
    padding-top: 5px;
    overflow: hidden;
}

.toolbar-button--material .instance-name {
    font-size: 16px;
    padding-left: 8px;
    color: #f4f4f4;
}

.instance-name {
    font-size: 15px;
    color: #f4f4f4;
    text-overflow: ellipsis;
    overflow: hidden;
}

.toolbar-button--material .resource-type {
    font-size: 13px;
    color: #ddd;
    margin-top: -37px;
    padding-left: 8px;
}

.toolbar--material .instance-name-position {
    padding-top: 13px;
}

.toolbar--material .instance-editor-back-btn {
    padding-top: 15px;
}

.toolbar-button--material .instance-editor-toolpanel-btn {
    margin-top: 5px;
    margin-right: -5px;
}

.resource-type {
    font-size: 11px;
    color: #ddd;
}

.subtitle-text-color {
    color: #aaa;
}

.resource-header {
    font-size: 18px;
}

.saving-popup {
  vertical-align: middle;
  font-size: 13px;
  color: #ddd;
  padding: 7px 10px;
  background: #7E0003;
  position: absolute;
  top: 5px;
  bottom: 8px;
  right: 5px;
  z-index: 100;
  border-radius: 2px;
}

.toolbar--material .saving-popup {
  padding: 12px 10px;
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

.instance-editor-header {
    background: #E2383C;
}

.instance-editor-back-btn {

}

.instance-editor-back-icon {
    padding: 3px 11px;
    color: #FEB0B2;
    background: #C2171B;
    border-radius: 50%;
    border: 1px solid #4C0002;
    margin-top: 5px;
    margin-left: 8px;
    margin-right: 6px;
}

.toolbar--material .instance-editor-back-btn {
    margin-right: 1px;
    margin-left: 5px;
    margin-top: 0px;
}

.toolbar--material .instance-editor-back-btn .instance-editor-back-icon {
    margin-top: -4px;
    margin-left: 3px;
    vertical-align: middle;
}

.instance-editor-toolpanel-btn {
    color: #ddd;
    margin-top: -3px;
}

.relative {
    position: relative;
}

.instance-tool-btn {
    position: absolute;
    top: 10px;
    right: 5px;
}
</style>
