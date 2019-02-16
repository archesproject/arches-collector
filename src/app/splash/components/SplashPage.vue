<template>
    <v-ons-page>
        <div class="splash-background">
            <v-ons-carousel fullscreen swipeable auto-scroll overscrollable
                :index.sync="carouselIndex"
            >
                <v-ons-carousel-item v-for="item in items" :key="item.title">
                    <div class="icon-circle">
                        <v-ons-icon class="pull-icon" v-bind:icon="item.icon" v-bind:style="{}"></v-ons-icon>
                    </div>
                    <div class="splash-text">
                        <div class="text">{{item.text}}</div>
                        <div class="title">{{item.title}}</div>
                    </div>
                </v-ons-carousel-item>
            </v-ons-carousel>
        </div>

        <div :style="dots">
            <span :index="dotIndex - 1" v-for="dotIndex in Object.keys(items).length" :key="dotIndex" style="cursor: pointer" @click="carouselIndex = dotIndex - 1">
                {{ carouselIndex === dotIndex - 1 ? '\u25CF' : '\u25CB' }}
            </span>
            <h4 style="color:black;">
                <router-link class="skip-link" :to="{ name: 'servermanager' }">Skip</router-link>
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
                    'icon': 'fa-comment',
                    'title': 'Welcome to Arches',
                    'text': "Welcome and salutations! Its Arches time.  Here's a long list of text just to see how it can be rendered using nothing but css"
                },
                {
                    'icon': 'fa-globe',
                    'title': 'Map Locations',
                    'text': 'Use Arches to map the location of important assets, events, or activities.  You can create new records, or update existing information from your Arches database.'
                },
                {
                    'icon': 'fa-code-fork',
                    'title': 'Many Projects, Multiple Surveys',
                    'text': "You can participate in many field surveys, even if they're being hosted from different Arches applications."
                },
                {
                    'icon': 'fa-signal',
                    'title': 'Work Offline',
                    'text': "Don't worry if you lose connection to a cell or WiFi network while you work.  Arches will store your information safely until you can reconnect to a network."
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
        /* background:url(../../../assets/img/arches_logo.png) no-repeat center top; /* 170px x 200px */ */
        /* background-size: 200px; */
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
    font-size: 28px;
    font-weight: 600;
    color: #484848;
    padding-top: 0px;
}

.splash-text > .text {
    margin-bottom: 15px;
    font-size: 14px;
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
    margin-top: 33%;
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
