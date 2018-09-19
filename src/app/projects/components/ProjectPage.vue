<template>
    <page-header-layout>
        <v-ons-page>
            <v-ons-toolbar style="background-color: whitesmoke;">
                <div class="left">
                    <v-ons-toolbar-button>
                        <router-link :to="{ name: 'projectlist' }">
                            <v-ons-icon class="text-color-dark project-header" icon="ion-android-arrow-dropleft-circle"></v-ons-icon>
                        </router-link>
                        <span class="text-color-dark project-name">{{project.name}}</span>
                    </v-ons-toolbar-button>
                </div>
                <div class="center"></div>
                <div class="right">
                    <v-ons-toolbar-button @click="toggleSideNav">
                        <v-ons-icon class="text-color-dark project-name" icon="fa-lightbulb"></v-ons-icon>
                    </v-ons-toolbar-button>
                </div>
            </v-ons-toolbar>
            <div id="sidenav" class="sidenav">
                <a @click="sync">
                    <!--  <v-ons-icon class="text-color-dark icon" icon="fa-cloud-download-alt"></v-ons-icon> -->
                    <v-ons-icon class="text-color-dark icon sync-spinner" v-if="!syncing && !sync_failed" icon="fa-cloud-download-alt"></v-ons-icon>
                    <v-ons-icon v-if="sync_failed" icon="ion-android-alert" class="sync-spinner"></v-ons-icon>
                    <v-ons-progress-circular v-if="syncing" indeterminate class="sync-spinner-offset">
                    </v-ons-progress-circular>
                    <span class="text-color-dark label">{{sync_btn_text}}</span>
                </a>
                <a @click="">
                    <v-ons-icon class="text-color-dark icon" icon="fa-filter"></v-ons-icon>
                    <span class="text-color-dark label">Filter records</span>
                </a>
                <a @click="">
                    <v-ons-icon class="text-color-dark icon" icon="fa-sort-alpha-down"></v-ons-icon>
                    <span class="text-color-dark label">Sort records</span>
                </a>
                <a @click="">
                    <v-ons-icon class="text-color-dark icon" icon="fa-trash-alt"></v-ons-icon>
                    <span class="text-color-dark label">Delete project</span>
                </a>
                <a @click="">
                    <v-ons-icon class="text-color-dark icon" icon="fa-map"></v-ons-icon>
                    <span class="text-color-dark label">Project map</span>
                </a>
                <a @click="toggleSideNav">
                    <v-ons-icon class="text-color-dark icon" icon="fa-arrow-alt-circle-left"></v-ons-icon>
                    <span class="text-color-dark label">Return to project list</span>
                </a>
            </div>
            <v-ons-carousel fullscreen swipeable auto-scroll overscrollable :index.sync="carouselIndex" id="projectCarousel">
                <v-ons-carousel-item class="page-background">
                    <select-resource-type-page :pageActive="carouselIndex === 0" />
                </v-ons-carousel-item>
                <v-ons-carousel-item class="page-background">
                    <select-resource-instance-page :project="project" />
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
                    <div class="text-color-dark label">Review</div>
                </a>
                <a v-bind:class="carouselIndex === 2 ? 'active' : ''" @click="carouselIndex = 2">
                    <v-ons-icon class="text-color-dark icon" icon="fa-clipboard"></v-ons-icon>
                    <div class="text-color-dark label">Summary</div>
                </a>
            </div>
            <div id="cover" class="cover"></div>
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
            showSideNav: true,
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
        toggleSideNav: function(event) {
            if (this.showSideNav) {
                document.getElementById('sidenav').style.right = '0%';
                document.getElementById('cover').style.display = 'block';
            } else {
                document.getElementById('sidenav').style.right = '-80%';
                document.getElementById('cover').style.display = 'none';
            }
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
        }
    }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.page-backgound-color {
    background-color: 'grey'
}

.project-header {
    font-size: 22px !important;
    vertical-align: -5% !important;
}

.project-name {
    font-size: 20px;
}

.page-background {
    background-color: white;
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
    width: 80%;
    position: fixed;
    z-index: 1;
    right: -80%;
    background-color: white;
    overflow-x: hidden;
    transition: 0.5s;
    font-size: 16px;
}

.sidenav .icon {
    font-family: FontAwesome5;
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