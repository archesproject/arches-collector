// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import './assets/css/fontawesome.min.css';
import 'vue-multiselect/dist/vue-multiselect.min.css';
import 'vue-datetime/dist/vue-datetime.css';
import './assets/css/index.css';

import Vue from 'vue';
import VueOnsen from 'vue-onsenui';
import Cordova from './assets/js/cordova';
import store from './store';
import router from './router';
import Multiselect from 'vue-multiselect';
import underscore from 'underscore';
import Datetime from 'vue-datetime';
import ToggleButton from 'vue-js-toggle-button';
import VueTouch from 'vue-touch';
import { ModelSelect } from 'vue-search-select';
import { ModelListSelect } from 'vue-search-select';

// globally registered components
import PageHeader from './app/shared/components/PageHeader.vue';
import PageHeaderLayout from './app/shared/components/PageHeaderLayout.vue';
import ProjectSummaryPage from './app/projects/components/ProjectSummaryPage.vue';
import ProjectMapPage from './app/projects/components/ProjectMapPage.vue';
import SelectResourceInstancePage from './app/projects/components/SelectResourceInstancePage.vue';
import SelectResourceTypePage from './app/projects/components/SelectResourceTypePage.vue';
import ResourceEditPage from './app/editor/components/ResourceEditPage.vue';
import ResourceEditForm from './app/editor/components/ResourceEditForm.vue';
import ResourceReportPage from './app/editor/components/ResourceReportPage.vue';
import BaseWidget from './app/widgets/BaseWidget.vue';
import StringWidget from './app/widgets/StringWidget.vue';
import ConceptWidget from './app/widgets/ConceptWidget.vue';
import ConceptListWidget from './app/widgets/ConceptListWidget.vue';
import DateWidget from './app/widgets/DateWidget.vue';
import DomainWidget from './app/widgets/DomainWidget.vue';
import EDTFWidget from './app/widgets/EDTFWidget.vue';
import DomainListWidget from './app/widgets/DomainListWidget.vue';
import NumberWidget from './app/widgets/NumberWidget.vue';
import BooleanWidget from './app/widgets/BooleanWidget.vue';
import GeojsonFeatureCollectionWidget from './app/widgets/GeojsonFeatureCollectionWidget.vue';
import FileListWidget from './app/widgets/FileListWidget.vue';
import ResourceInstanceWidget from './app/widgets/ResourceInstanceWidget.vue';
import NodeValueWidget from './app/widgets/NodeValueWidget.vue';
import Card from './app/editor/components/Card.vue';

Vue.component('multiselect', Multiselect);
Vue.component('model-select', ModelSelect);
Vue.component('model-list-select', ModelListSelect);

Vue.component('page-header', PageHeader);
Vue.component('page-header-layout', PageHeaderLayout);
Vue.component('project-summary-page', ProjectSummaryPage);
Vue.component('project-map-page', ProjectMapPage);
Vue.component('select-resource-instance-page', SelectResourceInstancePage);
Vue.component('select-resource-type-page', SelectResourceTypePage);
Vue.component('resource-edit-page', ResourceEditPage);
Vue.component('resource-edit-form', ResourceEditForm);
Vue.component('resource-report-page', ResourceReportPage);
Vue.component('base-widget', BaseWidget);
Vue.component('string-widget', StringWidget);
Vue.component('concept-widget', ConceptWidget);
Vue.component('concept-list-widget', ConceptListWidget);
Vue.component('date-widget', DateWidget);
Vue.component('domain-value-widget', DomainWidget);
Vue.component('domain-value-list-widget', DomainListWidget);
Vue.component('edtf-widget', EDTFWidget);
Vue.component('number-widget', NumberWidget);
Vue.component('boolean-widget', BooleanWidget);
Vue.component('geojson-feature-collection-widget', GeojsonFeatureCollectionWidget);
Vue.component('file-list-widget', FileListWidget);
Vue.component('resource-instance-widget', ResourceInstanceWidget);
Vue.component('node-value-widget', NodeValueWidget);
Vue.component('card', Card);
// Vue.config.productionTip = false;

Object.defineProperty(Vue.prototype, '$underscore', { value: underscore });

Vue.use(VueOnsen);
Vue.use(Cordova);
Vue.use(Datetime);
Vue.use(ToggleButton);
Vue.use(VueTouch);

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
