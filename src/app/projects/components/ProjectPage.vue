<template>
    <page-header-layout>
        <v-ons-carousel fullscreen swipeable auto-scroll overscrollable
            :index.sync="carouselIndex"
        >

            <v-ons-carousel-item>
                <div class="temp">
                    Screen to list resource types that can be created<br>
                    https://github.com/archesproject/arches-mobile/issues/6
                </div>
                <project-metadata-page />
            </v-ons-carousel-item>

            <v-ons-carousel-item>
                <div class="temp">
                    Screen to list resource types that can be created<br>
                    https://github.com/archesproject/arches-mobile/issues/6
                </div>
                <select-resouce-type-page />
            </v-ons-carousel-item>

            <v-ons-carousel-item>
                <div class="temp">
                    Screen showing list of resource instances in a project<br>
                    https://github.com/archesproject/arches-mobile/issues/7
                </div>
                <select-resouce-instance-page />
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
    </page-header-layout>
</template>

<script>
export default {
    name: 'Project',
    props: ['id'],
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


</style>
