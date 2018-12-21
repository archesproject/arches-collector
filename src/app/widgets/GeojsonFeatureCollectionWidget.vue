<template>
    <div v-if="context=='editor'">
        <div class="editor widget-label">{{widget.label}}</div>
        <div class="map-wrapper">
            <project-map></project-map>
        </div>
    </div>
    <ons-row class="report-widget" v-else-if="context=='report'">
        <ons-col class="report widget-label">{{widget.label}}</ons-col>
        <ons-col class="report widget-value">{{value}}</ons-col>
    </ons-row>
</template>


<script>
export default {
    name: 'GeojsonFeatureCollectionWidget',
    props: ['value', 'widget', 'context'],
    data() {
        return {};
    },
    methods: {
    },
    computed: {
    }
};
</script>

<style scoped>
    .map-wrapper {
        height: 200px;
    }
</style>
