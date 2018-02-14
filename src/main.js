// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import './assets/css/index.css';

import Vue from 'vue';
import VueOnsen from 'vue-onsenui';
import Cordova from './assets/js/cordova';
import store from './store';
import router from './router';

// globally registered components
import PageHeader from './app/shared/components/PageHeader.vue';
Vue.component('page-header', PageHeader);

// Vue.config.productionTip = false;

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
            var self = this;
            // Code that will run only after the
            // entire view has been rendered

            // check the application servers db
            // if there is no servers listed, then jump to the ServerManagerPage

            store.dispatch('initAppServers')
            .finally(function(doc) {
                // go to the last active server and project
                console.log(doc);
                if (self.$store.state.dbs.app_servers.active) {

                } else {
                    self.$router.push({'name': 'servermanager'});
                }
            });

            // if there are servers, then get the last active server and set it in the app

            Vue.cordova.on('deviceready', function() {
                this.deviceready = true;
            }, this);
        });
    }
});

router.push({'name': 'splash'});
