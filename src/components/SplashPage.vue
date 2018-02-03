<template>
  <v-ons-page>
    <div class="splash">
      <div class="blink">
        <p class="event listening">Connecting to Device {{deviceready}}</p>
        <p class="event received">Device is Ready {{deviceready}}</p>
      </div>
      <router-view/>
    </div>
  </v-ons-page>
</template>

<script>
export default {
  name: 'splashpage',
  computed: {
    deviceready() {
      return this.$store.state.cordova.deviceready;
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/* Portrait layout (default) */
.splash {
    background:url(../assets/img/arches_logo.png) no-repeat center top; /* 170px x 200px */
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

/* Landscape layout (with min-width) */
@media screen and (min-aspect-ratio: 1/1) and (min-width:400px) {
    .splash {
        /* background-position:left center;*/
        /* padding:75px 0px 75px 170px;  padding-top + padding-bottom + text area = image height */
        /* margin:-90px 0px 0px -198px;  offset vertical: half of image height */
                                      /* offset horizontal: half of image width and text area width */
    }
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
    display:block;
}

.event.received {
    background-color:#4B946A;
    display:none;
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
