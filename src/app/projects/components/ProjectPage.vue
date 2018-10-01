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
                        <v-ons-icon class="text-color-dark project-name" icon="fa-sort"></v-ons-icon>
                    </v-ons-toolbar-button>
                </div>
            </v-ons-toolbar>
            <v-ons-splitter>
                <v-ons-splitter-side width="80%"
                    swipeable collapse="" side="right"
                    :open.sync="showSideNav" class="sidenav toolbar-header">
                    <v-ons-page>
                        <v-ons-list style="margin-top: 5px;">
                            <v-ons-list-item tappable @click="sync">
                                <v-ons-icon class="text-color-dark icon" v-if="syncing === false" icon="fa-cloud-download-alt"></v-ons-icon>
                                <v-ons-icon class="text-color-dark icon" v-if="sync_failed === true" icon="ion-android-alert"></v-ons-icon>
                                <span class="text-color-dark label right-panel-label">{{sync_btn_text}}</span>
                            </v-ons-list-item @click="">
                            <v-ons-list-item tappable>
                                <v-ons-icon class="text-color-dark icon" icon="fa-filter"></v-ons-icon>
                                <span class="text-color-dark label right-panel-label">Filter records</span>
                            </v-ons-list-item @click="">
                            <v-ons-list-item tappable @click="sort">
                                <v-ons-icon class="text-color-dark icon" icon="fa-sort-alpha-down"></v-ons-icon>
                                <span class="text-color-dark label right-panel-label">Sort by name</span>
                            </v-ons-list-item @click="">
                            <v-ons-list-item tappable>
                                <v-ons-icon class="text-color-dark icon" icon="fa-sort-amount-desc"></v-ons-icon>
                                <span class="text-color-dark label right-panel-label">Most recent edit</span>
                            </v-ons-list-item @click="">
                            <v-ons-list-item tappable>
                                <v-ons-icon class="text-color-dark icon" icon="fa-map"></v-ons-icon>
                                <span class="text-color-dark label right-panel-label">Project map</span>
                            </v-ons-list-item @click="">
                            <v-ons-list-item tappable @click="toggleSideNav">
                                <v-ons-icon class="text-color-dark icon" icon="fa-arrow-alt-circle-left"></v-ons-icon>
                                <span class="text-color-dark label right-panel-label">Return to project list</span>
                            </v-ons-list-item >
                        </v-ons-list>
                    </v-ons-page>
                </v-ons-splitter-side>

                <v-ons-splitter-content class="project-list-panel">
                    <v-ons-page>
                        <div>
                            <v-ons-carousel fullscreen swipeable auto-scroll overscrollable :index.sync="carouselIndex" id="projectCarousel">
                                <v-ons-carousel-item class="page-background">
                                    <select-resource-type-page :pageActive="carouselIndex === 0" />
                                </v-ons-carousel-item>
                                <v-ons-carousel-item class="page-background">
                                    <select-resource-instance-page :project="project" ref="sripage"/>
                                </v-ons-carousel-item>
                                <v-ons-carousel-item class="page-background">
                                    <project-summary-page :project="project" />
                                </v-ons-carousel-item>
                            </v-ons-carousel>
                            <div class="navbar">
                                <a v-bind:class="carouselIndex === 0 ? 'active' : ''" @click="carouselIndex = 0">
                                    <v-ons-icon class="text-color-dark icon" icon="fa-plus-circle"></v-ons-icon>
                                    <div class="text-color-dark label">New</div>
                                </a>
                                <a v-bind:class="carouselIndex === 1 ? 'active' : ''" @click="carouselIndex = 1">
                                    <v-ons-icon class="text-color-dark icon" icon="fa-check-circle"></v-ons-icon>
                                    <div class="text-color-dark label">Edit Resource</div>
                                </a>
                                <a v-bind:class="carouselIndex === 2 ? 'active' : ''" @click="carouselIndex = 2">
                                    <v-ons-icon class="text-color-dark icon" icon="fa-clipboard"></v-ons-icon>
                                    <div class="text-color-dark label">Summary</div>
                                </a>
                            </div>
                        </div>
                    </v-ons-page>
                </v-ons-splitter-content>
            </v-ons-splitter>
        </v-ons-page>
    </page-header-layout>
</template>
<script>
export default {
    name: 'Project',
    props: ['project'],
    data() {
        return {
            carouselIndex: 0,
            showSideNav: false,
            syncing: false,
            sync_failed: false
        };
    },
    computed: {
        sync_btn_text() {
            return (this.syncing ? 'Syncing...' : (this.sync_failed ? 'Sync Failed' : (this.project.lastsync.date === '' ? 'Join Project' : 'Sync Now')));
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
            this.$store.dispatch('syncRemote', this.project.id)
                .catch(function() {
                    self.sync_failed = true;
                })
                .finally(function(doc) {
                    console.log('syncing done');
                    self.syncing = false;
                });
        },
        sort: function() {
            this.$refs.sripage.sorted = !this.$refs.sripage.sorted;
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
    height: 50px;
    background: #f4f4f4;
    padding-top: 2px;
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
    margin-top: 6px;
}

.right-panel-label {
    font-size: 15px;
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
    width: 33%;
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
</style>
