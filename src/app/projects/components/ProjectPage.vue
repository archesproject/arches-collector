<template>
    <page-header-layout>
        <v-ons-page>
            <v-ons-toolbar style="background-color: whitesmoke;">
                <div class="left">
                    <v-ons-toolbar-button>
                        <router-link :to="{ name: 'projectlist' }"><v-ons-icon class="text-color-dark project-header" icon="ion-android-arrow-dropleft-circle"></v-ons-icon></router-link>
                        <span class="text-color-dark project-name">{{project.name}}</span>
                    </v-ons-toolbar-button>
                </div>
                <div class="center"></div>
                <div class="right">
                    <v-ons-toolbar-button>
                        <v-ons-icon class="text-color-dark project-name" icon="ion-ios-cloud-download-outline"></v-ons-icon>
                    </v-ons-toolbar-button>
                </div>
            </v-ons-toolbar>

            <v-ons-carousel fullscreen swipeable auto-scroll overscrollable
                :index.sync="carouselIndex"
                id="projectCarousel"
            >

                <v-ons-carousel-item class="padded-page">
                    <select-resource-type-page :pageActive="carouselIndex === 0"/>
                </v-ons-carousel-item>

                <v-ons-carousel-item class="padded-page">
                    <select-resource-instance-page :project="project"/>
                </v-ons-carousel-item>

                <v-ons-carousel-item class="padded-page map-page">
                    <project-map-page :project="project"/>
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
            dots: {
                textAlign: 'center',
                fontSize: '30px',
                color: '#3e3e3e',
                position: 'absolute',
                bottom: '2%',
                left: 0,
                right: 0,
                count: 4
            }
        };
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

    .project-header{
        font-size: 22px !important;
        vertical-align: -5% !important;
    }

    .project-name{
        font-size: 20px;
    }

    .padded-page > ons-page {
        margin: 20px;
    }

    .padded-page.map-page > ons-page {
        margin-bottom: 60px;
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

</style>
