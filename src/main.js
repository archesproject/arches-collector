// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';

import Vue from 'vue';
import VueOnsen from 'vue-onsenui';
import store from './store';
import App from './App';
import Cordova from './assets/js/cordova';

Vue.config.productionTip = false;

Vue.use(VueOnsen);
Vue.use(Cordova);

/* eslint-disable no-new */
window.archesvue = new Vue({
    el: '#app',
    store,
    data: {
        deviceready: false
    },
    template: '<App :deviceready="deviceready"/>',
    components: {
        App
    },
    mounted: function() {
        this.$nextTick(() => {
            // Code that will run only after the
            // entire view has been rendered

            Vue.cordova.on('deviceready', function() {
                this.deviceready = true;

                // or you could do this if you want to use the store,
                // then you wouldn't have to pass in the value into the template
                // this.$store.state.cordova.commit('deviceready', this.deviceready);
            }, this);
        });
    }
});
