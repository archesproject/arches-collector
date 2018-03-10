<template>
    <v-ons-page>
        <div class="splash-background">
            <v-ons-carousel fullscreen swipeable auto-scroll overscrollable
                :index.sync="carouselIndex"
            >
                <v-ons-carousel-item v-for="item in items" :key="item.title">
                    <div class="splash-text">
                        <div class="title">{{item.title}}</div>
                        <div class="text">{{item.text}}</div>
                    </div>
                </v-ons-carousel-item>
            </v-ons-carousel>
        </div>

        <div :style="dots">
            <span :index="dotIndex - 1" v-for="dotIndex in Object.keys(items).length" :key="dotIndex" style="cursor: pointer" @click="carouselIndex = dotIndex - 1">
                {{ carouselIndex === dotIndex - 1 ? '\u25CF' : '\u25CB' }}
            </span>
            <h4 style="color:black;">
                <router-link :to="{ name: 'servermanager' }">Skip</router-link>
                <router-link :to="{ name: 'projectmap' }">Map</router-link>
            </h4>
        </div>
    </v-ons-page>
</template>

<script>

export default {
    name: 'SplashPage',
    props: ['deviceready'],
    data() {
        return {
            carouselIndex: 0,
            items: [
                {
                    'title': '',
                    'text': ''
                },
                {
                    'title': 'Map Locations',
                    'text': 'blah blah blah'
                },
                {
                    'title': 'Manage Projects',
                    'text': 'blah blah blah'
                },
                {
                    'title': 'Work Offline',
                    'text': 'blah blah blah'
                }
            ],
            dots: {
                textAlign: 'center',
                fontSize: '30px',
                color: '#3e3e3e',
                position: 'absolute',
                bottom: '2%',
                left: 0,
                right: 0
            }
        };
    }
    // computed: {
    //   deviceready() {
    //     return this.$store.state.cordova.deviceready;
    //   }
    // },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

/* Portrait layout (default) */
.splash-background {
        background:url(../../../assets/img/arches_logo.png) no-repeat center top; /* 170px x 200px */
        background-size: 200px;
        background-position-y:28%;
        text-align: center;
        height: 100%;
}

.splash-text {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 25%;
}

.splash-text > .title {
    font-size: 20px;
    font-weight: 600;
    color: #484848;
}

.splash-text > .text {
    font-size: 10px;
    color: #616161;
}

.event {
        border-radius:4px;
        -webkit-border-radius:4px;
        color:#FFFFFF;
        font-size:12px;
        margin:0px 30px;
        padding:2px 0px;
}

.event.listening {
        background-color:#333333;
}

.event.received {
        background-color:#4B946A;
}

@keyframes fade {
        from { opacity: 1.0; }
        50% { opacity: 0.4; }
        to { opacity: 1.0; }
}

@-webkit-keyframes fade {
        from { opacity: 1.0; }
        50% { opacity: 0.4; }
        to { opacity: 1.0; }
}

.blink {
        animation:fade 3000ms infinite;
        -webkit-animation:fade 3000ms infinite;
}

</style>
