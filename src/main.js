// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import './assets/css/index.css';
import './assets/css/fontawesome.min.css';

import Vue from 'vue';
import VueOnsen from 'vue-onsenui';
import Cordova from './assets/js/cordova';
import store from './store';
import router from './router';

import underscore from 'underscore';

// globally registered components
import PageHeader from './app/shared/components/PageHeader.vue';
import PageHeaderLayout from './app/shared/components/PageHeaderLayout.vue';
import ProjectSummaryPage from './app/projects/components/ProjectSummaryPage.vue';
import SelectResourceInstancePage from './app/projects/components/SelectResourceInstancePage.vue';
import SelectResourceTypePage from './app/projects/components/SelectResourceTypePage.vue';
import ResourceEditPage from './app/editor/components/ResourceEditPage.vue';
import ResourceTreePage from './app/editor/components/ResourceTreePage.vue';
Vue.component('page-header', PageHeader);
Vue.component('page-header-layout', PageHeaderLayout);
Vue.component('project-summary-page', ProjectSummaryPage);
Vue.component('select-resource-instance-page', SelectResourceInstancePage);
Vue.component('select-resource-type-page', SelectResourceTypePage);
Vue.component('resource-edit-page', ResourceEditPage);
Vue.component('resource-tree-page', ResourceTreePage);
// Vue.config.productionTip = false;

Object.defineProperty(Vue.prototype, '$underscore', { value: underscore });

Vue.use(VueOnsen);
Vue.use(Cordova);

/* eslint-disable no-new */
window.archesvue = new Vue({
    el: '#app',
    store,
    router,
    data: {
        deviceready: false,
        init: function() {
            var self = this;
            this.deviceready = true;

            store.dispatch('initServerStore')
                .finally(function(doc) {
                    console.log(doc);
                    if (store.getters.activeServer) {
                    // go to the last active server and project
                        self.$router.push({'name': 'projectlist'});
                    } else {
                    // if there is no servers listed, then jump to the ServerManagerPage
                        self.$router.push({'name': 'servermanager'});
                    }
                });
        }
    },
    template: '<router-view></router-view>',
    mounted: function() {
        this.$nextTick(() => {
            // Code that will run only after the
            // entire view has been rendered

            // if running in the browser
            if (!window.cordova) {
                this.init();
            }

            // if runing in the device
            Vue.cordova.on('deviceready', function() {
                this.init();
            }, this);
        });
    }
});

router.push({'name': 'splash'});
