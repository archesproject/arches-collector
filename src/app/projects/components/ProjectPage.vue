<template>
    <page-header-layout>
        <v-ons-page>
            <v-ons-toolbar class="project-list-toolbar">
                <div class="left">
                    <v-ons-toolbar-button>
                        <router-link :to="{ name: 'projectlist' }">
                            <v-ons-icon class="text-color-dark project-header" style="vertical-align: -2px;" icon="ion-android-arrow-dropleft-circle"></v-ons-icon>
                        </router-link>
                        <span class="text-color-dark project-name">{{project.name}}</span>
                    </v-ons-toolbar-button>
                </div>
                <div class="center"></div>
                <div class="right">
                    <v-ons-toolbar-button @click="toggleSideNav">
                        <v-ons-icon class="text-color-dark project-name" icon="fa-cogs"></v-ons-icon>
                    </v-ons-toolbar-button>
                </div>
            </v-ons-toolbar>
            <v-ons-splitter>
                <v-ons-splitter-side width="325px"
                    swipeable collapse="" side="right"
                    :open.sync="showSideNav" class="sidenav toolbar-header">
                    <v-ons-page>
                        <v-ons-list style="margin-top: 0px;">
                            <v-ons-list-item tappable @click="sync">
                                <v-ons-icon class="text-color-dark icon" icon="fa-comments"></v-ons-icon>
                                <div class="menu-text">
                                    <span class="text-color-dark label right-panel-label">Synch survey data</span>
                                    <div class="menu-subtext">Send/get data from cloud</div>
                                </div>
                            </v-ons-list-item>
                            <v-ons-progress-bar indeterminate v-if="syncing"></v-ons-progress-bar>
                            <v-ons-list-item tappable @click="sortByName">
                                <v-ons-icon class="text-color-dark icon" icon="fa-sort-alpha-down"></v-ons-icon>
                                <div class="menu-text">
                                    <span class="text-color-dark label right-panel-label">Sort by name</span>
                                    <div class="menu-subtext">Toggle order of resource list</div>
                                </div>
                            </v-ons-list-item>
                            <v-ons-list-item tappable @click="sortByEditDate">
                                <v-ons-icon class="text-color-dark icon" icon="fa-sort-amount-desc"></v-ons-icon>
                                <div class="menu-text">
                                    <span class="text-color-dark label right-panel-label">Most recent edit</span>
                                    <div class="menu-subtext">Toggle order of resource list</div>
                                </div>
                            </v-ons-list-item>
                        </v-ons-list>
                    </v-ons-page>
                </v-ons-splitter-side>

                <v-ons-splitter-content class="project-list-panel">

                      <v-ons-tabbar swipeable animation="none" :index.sync="activeIndex">
                        <template slot="pages">
                            <select-resource-type-page></select-resource-type-page>
                            <select-resource-instance-page :project="project" :lastsync="lastsync" ref="sripage"></select-resource-instance-page>
                            <project-map-page :project="project" :lastsync="lastsync"></project-map-page>
                            <project-summary-page :project="project"></project-summary-page>
                        </template>

                        <v-ons-tab v-for="(tab, i) in tabs"
                          :icon="tabs[i].icon"
                          :label="tabs[i].label"
                          :badge="tabs[i].badge"
                          ></v-ons-tab>
                      </v-ons-tabbar>

                </v-ons-splitter-content>
            </v-ons-splitter>
        </v-ons-page>
    </page-header-layout>
</template>
<script>
export default {
    name: 'Project',
    props: ['project', 'tabIndex'],
    data() {
        return {
            showSideNav: false,
            syncing: false,
            sync_failed: false,
            activeIndex: 0,
            lastsync: '',
            tabs: [
                {
                    icon: 'fa-plus-circle',
                    label: 'New',
                    key: 'SelectResourceTypePage'
                },
                {
                    icon: 'fa-edit',
                    label: 'Review',
                    key: 'SelectResourceInstancePage'
                },
                {
                    icon: 'fa-map-marker-alt',
                    label: 'Map',
                    key: 'ProjectMapPage'
                },
                {
                    icon: 'fa-clipboard',
                    label: 'Summary',
                    key: 'ProjectSummaryPage'
                }
            ]
        };
    },
    computed: {
        title() {
            return this.tabs[this.activeIndex].label;
        }
    },
    methods: {
        toggleSideNav: function() {
            this.showSideNav = !this.showSideNav;
        },
        sync: function() {
            var self = this;
            this.syncing = true;
            this.sync_failed = false;
            this.$store.dispatch('syncRemote', {'projectId': this.project.id})
                .catch(function() {
                    self.sync_failed = true;
                })
                .finally(function(doc) {
                    self.syncing = false;
                    self.lastsync = self.project.lastsync;
                });
        },
        sortByName: function() {
            this.$refs.sripage.sortValue = 'name';
            this.$refs.sripage.sorted = !this.$refs.sripage.sorted;
        },
        sortByEditDate: function() {
            this.$refs.sripage.sortValue = 'editDate';
            this.$refs.sripage.sorted = !this.$refs.sripage.sorted;
        }
    },
    created: function() {
        if (this.$route.params.tabIndex !== '' && this.$route.params.tabIndex !== undefined) {
            this.activeIndex = parseInt(this.$route.params.tabIndex);
        }
    }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.page-backgound-color {
    background-color: 'grey'
}

.project-list-toolbar {
    background: #ddd;
    border-bottom: 1px solid #aaa;
}

.project-header {
    font-size: 22px !important;
}

.project-name {
    font-size: 17px;
    vertical-align: 1px;
}

.page-background {
    background-color: white;
}

.project-list-panel {
    margin-top: 1px;
}

.right-panel-label {
    font-size: 14px;
}

.sidenav .icon {
    font-size: 14px;
}

.list-item {
    border-bottom: 1px solid #eee;
}

.padded-page.map-page > ons-page {
    margin-bottom: 60px;
}

.cover {
    width: 100%;
    background-color: gray;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    opacity: .2;
    display: none;
}

.sync-spinner {
    width: 20px;
    height: 20px;
}

.sync-spinner-offset {
    width: 20px;
    height: 20px;
    position: relative;
    left: -5px;
    top: 6px;
}


/* Place the navbar at the bottom of the page, and make it stick */

.navbar {
    background-color: #f5f5f5;
    overflow: hidden;
    position: fixed;
    bottom: 0;
    width: 100%;
    padding: 0;
    margin: 0;
    list-style: none;
    display: -webkit-box;
    display: -moz-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-flow: row wrap;
    justify-content: space-around;
}


/* Style the links inside the navigation bar */

.navbar a {
    float: left;
    display: block;
    color: #f2f2f2;
    text-align: center;
    padding: 14px 0px;
    text-decoration: none;
    font-size: 17px;
    width: 25%;
    flex-grow: 1;
}

.navbar .icon {
    font-size: 14px !important;
    font-family: FontAwesome5;
}

.navbar .label {
    font-size: 12px !important;
}


/* Change the color of links on hover */


/*.navbar a:hover {
            background-color: #ddd;
            color: black;
        }*/


/* Add a color to the active/current link */

.navbar a.active {
    background-color: white;
    color: white;
}

.sidenav {
    height: 100%;
    width: 60%;
    background-color: white;
    overflow-x: hidden;
    font-size: 16px;
}

.sidenav .icon {
    font-family: FontAwesome5;
    width: 25px;
}

.sidenav a {
    padding: 22px;
    text-decoration: none;
    display: block;
    transition: 0.3s;
    border-bottom: solid 2px #e8e8e8;
}

.sidenav a:hover {
    color: #f1f1f1;
}

.menu-subtext {
    font-size: 12px;
    color: #888;
}
</style>
