// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import './assets/css/index.css'

import Vue from 'vue';
import VueOnsen from 'vue-onsenui';
import Cordova from './assets/js/cordova';
import store from './store';
import router from './router';

Vue.config.productionTip = false;

Vue.use(VueOnsen);
Vue.use(Cordova);

/* eslint-disable no-new */
window.archesvue = new Vue({
    el: '#app',
    store,
    router,
    data: {
        deviceready: false
    },
    template: '<router-view></router-view>',
    mounted: function() {
        this.$nextTick(() => {
            // Code that will run only after the
            // entire view has been rendered

            Vue.cordova.on('deviceready', function() {
                this.deviceready = true;

                // check the application servers db
                // if there is no servers listed, then jump to the ServerManagerPage
                // if there are servers, then get the last active server and set it in the app

                // or you could do this if you want to use the store,
                // then you wouldn't have to pass in the value into the template
                // this.$store.state.cordova.commit('deviceready', this.deviceready);
            }, this);
        });
    }
});
 
router.push('splash');