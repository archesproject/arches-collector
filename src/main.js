// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import './assets/css/fontawesome.min.css';
import 'vue-datetime/dist/vue-datetime.css';
import './assets/css/index.css';

import Vue from 'vue';
import VueOnsen from 'vue-onsenui';
import Cordova from './assets/js/cordova';
import store from './store';
import router from './router';
import underscore from 'underscore';
import Datetime from 'vue-datetime';
import ToggleButton from 'vue-js-toggle-button';
import VueTouch from 'vue-touch';
import { ModelSelect, MultiSelect, ModelListSelect, MultiListSelect } from 'vue-search-select';

// globally registered components
import PageHeader from './app/shared/components/PageHeader.vue';
import PageHeaderLayout from './app/shared/components/PageHeaderLayout.vue';
import ProjectMap from './app/shared/components/ProjectMap.vue';
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
import ResourceInstanceWidgetV4 from './app/widgets/ResourceInstanceWidget-v4.vue';
import ResourceInstanceListWidget from './app/widgets/ResourceInstanceListWidget.vue';
import ResourceInstanceListWidgetV4 from './app/widgets/ResourceInstanceListWidget-v4.vue';
import NodeValueWidget from './app/widgets/NodeValueWidget.vue';
import Card from './app/editor/components/Card.vue';

Vue.component('model-select', ModelSelect);
Vue.component('multi-select', MultiSelect);
Vue.component('model-list-select', ModelListSelect);
Vue.component('multi-list-select', MultiListSelect);

Vue.component('page-header', PageHeader);
Vue.component('page-header-layout', PageHeaderLayout);
Vue.component('project-map', ProjectMap);
Vue.component('project-summary-page', ProjectSummaryPage);
Vue.component('project-map-page', ProjectMapPage);
Vue.component('select-resource-instance-page', SelectResourceInstancePage);
Vue.component('select-resource-type-page', SelectResourceTypePage);
Vue.component('resource-edit-page', ResourceEditPage);
Vue.component('resource-edit-form', ResourceEditForm);
Vue.component('resource-report-page', ResourceReportPage);
Vue.component('base-widget', BaseWidget);
Vue.component('card', Card);

var widgetMapping = {
    'string-widget': StringWidget,
    'concept-widget': ConceptWidget,
    'concept-list-widget': ConceptListWidget,
    'date-widget': DateWidget,
    'domain-value-widget': DomainWidget,
    'domain-value-list-widget': DomainListWidget,
    'edtf-widget': EDTFWidget,
    'number-widget': NumberWidget,
    'boolean-widget': BooleanWidget,
    'geojson-feature-collection-widget': GeojsonFeatureCollectionWidget,
    'file-list-widget': FileListWidget,
    'resource-instance-widget': {
        'widgetVersions': {
            '^4.0.0': { // using semantic versioning, this widget will be used with Arches up to but not including v5.0.0
                'resource-instance-widget-v4': ResourceInstanceWidgetV4
            }
        },
        'latest': ResourceInstanceWidget
    },
    'resource-instance-list-widget': {
        'widgetVersions': {
            '^4.0.0': { // using semantic versioning, this widget will be used with Arches up to but not including v5.0.0
                'resource-instance-list-widget-v4': ResourceInstanceListWidgetV4
            }
        },
        'latest': ResourceInstanceListWidget
    },
    // 'resource-instance-list-widget-v4': ResourceInstanceListWidget__V4,
    'node-value-widget': NodeValueWidget
};
Object.defineProperty(Vue.prototype, '$widgetMapping', {value: widgetMapping});
for (let [key, value] of Object.entries(widgetMapping)) {
    if (!!value.widgetVersions) {
        // this widget is versioned
        Vue.component(key, value.latest);
        for (let [verNum, item] of Object.entries(value.widgetVersions)) {
            var componentName = Object.keys(item)[0];
            Vue.component(componentName, item[componentName]);
        }
    } else {
        // this widget isn't versioned
        Vue.component(key, value);
    }
}

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

            store.dispatch('initServerStoreFromPouch')
                .finally(function(doc) {
                    if (store.getters.activeServer) {
                    // go to the last active server and project
                        self.$router.push({ name: 'projectlist' });
                    } else if (Object.keys(store.getters.servers).length > 0) {
                    // if there is no active servers then let the user select the server
                        self.$router.push({ name: 'serverlist' });
                    }
                });
        }
    },
    template: '<router-view></router-view>',
    beforeMount() {
        const html = document.documentElement;
        this.$ons._ons.ready(() => {
            if (this.$ons._ons.fastClick) {
                this.$ons._ons.fastClick.destroy();
            }
        });
        if (this.$ons.platform.isIPhoneX()) {
            html.setAttribute('onsflag-iphonex-portrait', '');
            html.setAttribute('onsflag-iphonex-landscape', '');
        }
    },
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

router.push({ name: 'splash' });
