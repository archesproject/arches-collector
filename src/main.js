// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'onsenui/css/onsenui.css'
import 'onsenui/css/onsen-css-components.css'

import Vue from 'vue'
import VueOnsen from 'vue-onsenui'
import store from './store'
import App from './App'
import Cordova from './components/CordovaPage'

Vue.config.productionTip = false

Vue.use(VueOnsen)

/* eslint-disable no-new */
new Vue({
    el: '#app',
    store,
    template: '<App/>',
    components: { 
        App,
        Cordova
    },
    mounted: function () {
        this.$nextTick(() => {
            // Code that will run only after the
            // entire view has been rendered
            
            this.ready = Cordova.initialize(store);
            //document.addEventListener('deviceready', this.$options.onDeviceReady.bind(this.$options), false);
        })
    },
    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.ready = true;
        console.log(this.ready);
        this.store.commit('deviceready', this.ready);
        //this.receivedEvent('deviceready');
    },
})
