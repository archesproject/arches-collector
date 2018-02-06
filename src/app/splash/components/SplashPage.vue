<template>
  <v-ons-page>
    <div class="splash">
      <div class="blink">
        <div v-if="!deviceready">
            <p class="event listening">Connecting to Device</p>
        </div>
        <div v-else>
            <p class="event received">Device is Ready</p>
            {{deviceready}}
        </div>
      </div>
      <router-view/>
    </div>
  </v-ons-page>
</template>

<script>
export default {
  name: 'splashpage',
  props: ['deviceready']
  // computed: {
  //   deviceready() {
  //     return this.$store.state.cordova.deviceready;
  //   }
  // },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* Portrait layout (default) */
.splash {
    background:url(../../../assets/img/arches_logo.png) no-repeat center top; /* 170px x 200px */
    background-size: 75%;
    position:absolute;             /* position in the center of the screen */
    left:50%;
    top:50%;
    height:150px;                   /* text area height */
    width:225px;                   /* text area width */
    text-align:center;
    padding:180px 0px 0px 0px;     /* image height is 200px (bottom 20px are overlapped with text) */
    margin:-115px 0px 0px -112px;  /* offset vertical: half of image height and text area height */
                                   /* offset horizontal: half of text area width */
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
