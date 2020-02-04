<template>
    <v-ons-page>
        <div class="splash-background" style="background-color: #fff;">
            <v-ons-carousel fullscreen swipeable auto-scroll overscrollable
                :index.sync="carouselIndex"
            >
                <v-ons-carousel-item v-for="item in items" :key="item.title">
                    <div class="icon-circle">
                        <v-ons-icon class="pull-icon" v-bind:icon="item.icon" v-bind:style="{}"></v-ons-icon>
                    </div>
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
                <router-link class="skip-link" :to="{ name: 'servermanager' }">Sign In</router-link>
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
                    icon: 'fa-comment',
                    title: 'Arches Collector',
                    text: 'Arches Collector allows you to access, create and update data in your Arches instance from your mobile device. Link to your Arches instance using your current account.'
                },
                {
                    icon: 'fa-globe',
                    title: 'Map Locations',
                    text: 'Use Arches to map the location of important resources, events, or activities. You can create new resources, or update existing information from your Arches instance.'
                },
                {
                    icon: 'fa-code-fork',
                    title: 'Multiple Projects',
                    text: 'You can work on multiple data collection projects at the same time. You can even participate in projects hosted by different Arches instances.'
                },
                {
                    icon: 'fa-signal',
                    title: 'Work Offline',
                    text: 'You can collect data even when you are not connected to a mobile or WiFi network. Arches Collector will store your information until you can reconnect to a network.'
                }
            ],
            dots: {
                textAlign: 'center',
                fontSize: '28px',
                color: '#999',
                position: 'absolute',
                bottom: '5%',
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
        background-position-y:20%;
        text-align: center;
        height: 100%;
}

.page--material__background {
    background-color: #fff;
}

.splash-text {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 22%;
}

.splash-text > .title {
    font-size: 28px;
    font-weight: 600;
    color: #484848;
    margin-top: 20px;
}

.splash-text > .text {
    margin-bottom: 15px;
    font-size: 13px;
    padding: 10px 15%;
    color: #aaa;
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

.icon-circle {
    display: none;
    margin-top: 65%;
    margin-left: 40%;
    margin-bottom: 20px;
    box-sizing: border-box;
    border: solid 1px steelblue;
    border-radius: 50%;
    height: 80px;
    width: 80px;
    background: #F5FAFE;
}

.pull-icon {
    color: steelblue;
    padding-top: 20px;
    padding-left: 3px;
    font-size: 36px;
}

.skip-link {
    font-weight: 600;
    text-decoration: none;
}

</style>
