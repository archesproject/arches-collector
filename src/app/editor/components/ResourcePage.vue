<template>
    <page-header-layout>
        <v-ons-page>
            <v-ons-toolbar style="background-color: whitesmoke;">
                <div class="left">
                    <v-ons-toolbar-button>
                        <v-ons-icon class="text-color-dark resource-header" icon="ion-android-arrow-dropleft-circle" @click="back"></v-ons-icon>
                        <span class="text-color-dark resource-header">{{headerName}}</span>
                    </v-ons-toolbar-button>
                </div>
                <div class="center"></div>
                <div class="right">
                    <transition name="fade"><span class="saving-popup" v-show="saving">saving...</span></transition>
                </div>
            </v-ons-toolbar>
            <v-ons-splitter>
                <v-ons-splitter-content>
                    <v-ons-page>
                        <div>
                            <v-ons-carousel fullscreen swipeable auto-scroll overscrollable :index.sync="carouselIndex" id="resourceCarousel">
                                <v-ons-carousel-item class="page-background">
                                    <resource-report-page :project="project" />
                                </v-ons-carousel-item>
                                <v-ons-carousel-item class="page-background">
                                    <resource-edit-page v-on:saving="saving = $event" :goBack="goBack"/>
                                </v-ons-carousel-item>
                            </v-ons-carousel>
                            <div class="navbar">
                                <a v-bind:class="carouselIndex === 0 ? 'active' : ''" @click="carouselIndex = 0">
                                    <v-ons-icon class="text-color-dark icon" icon="fa-file-alt"></v-ons-icon>
                                    <div class="text-color-dark label">Resource Report</div>
                                </a>
                                <a v-bind:class="carouselIndex === 1 ? 'active' : ''" @click="carouselIndex = 1">
                                    <v-ons-icon class="text-color-dark icon" icon="fa-check"></v-ons-icon>
                                    <div class="text-color-dark label">Editor</div>
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
    name: 'ResourcePage',
    props: ['nodegroupid'],
    data() {
        return {
            goBack: false,
            carouselIndex: 1,
            saving: false,
            project: this.$store.getters.activeProject
        }
    },
    computed: {
        currentNavItem: function() {
            if (!!this.$store.getters.activeServer) {
                return this.$store.getters.activeServer.card_nav_stack[0];
            }
        },
        headerName: function() {
            var navItem = this.currentNavItem;
            if (!!navItem) {
                return navItem.card.name;
            } else {
                return this.$store.getters.activeGraph.name;
            }
        }
    },
    methods: {
        back: function() {
            this.goBack = !this.goBack;
        },
    },
    mounted: function() {
        console.log('mounted');
        if (!!this.$store.getters.activeServer) {
            this.$store.getters.activeServer.card_nav_stack = [];
            this.$store.getters.activeServer.card_nav_stack.unshift(this.card);
        }
    }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.page-background {
    background-color: white;
}

.padded-page.map-page > ons-page {
    margin-bottom: 60px;
}

.resource-header {
    font-size: 18px;
}

.saving-popup {
    padding-right: 20px;
    font-size: 16px;
    color: #359a35;
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

.navbar a.active {
    background-color: white;
    color: white;
}
</style>