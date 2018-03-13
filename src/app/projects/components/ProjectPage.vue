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

                <v-ons-carousel-item>
                    <div class="project-page">
                        <project-metadata-page :project="project" :pageActive="carouselIndex === 0" />
                    </div>
                </v-ons-carousel-item>

                <v-ons-carousel-item>
                    <div class="project-page">
                        Screen to list resource types that can be created<br>
                        https://github.com/archesproject/arches-mobile/issues/6
                        <select-resouce-type-page />
                    </div>
                </v-ons-carousel-item>

                <v-ons-carousel-item>
                    <div class="project-page">
                        Screen showing list of resource instances in a project<br>
                        https://github.com/archesproject/arches-mobile/issues/7
                        <select-resouce-instance-page />
                    </div>
                </v-ons-carousel-item>

                <v-ons-carousel-item>
                    <project-map-page />
                </v-ons-carousel-item>

            </v-ons-carousel>

            <div :style="dots">
                <span :index="dotIndex - 1" v-for="dotIndex in dots.count" :key="dotIndex" style="cursor: pointer" @click="carouselIndex = dotIndex - 1">
                    {{ carouselIndex === dotIndex - 1 ? '\u25CF' : '\u25CB' }}
                </span>
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

    .project-page{
        margin: 20px;
    }

</style>
