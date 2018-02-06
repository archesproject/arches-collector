<template>
  <v-ons-page id="app">
    <splash-page :deviceready="deviceready"></splash-page>
  </v-ons-page>
</template>

<script>
import SplashPage from './app/splash/components/SplashPage';

export default {
  name: 'app',
  props: ['deviceready'],
  components: {
    SplashPage
  }
}
</script>

