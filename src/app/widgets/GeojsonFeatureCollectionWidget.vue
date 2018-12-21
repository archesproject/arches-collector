<template>
    <div v-if="context=='editor'">
        <div class="editor widget-label">{{widget.label}}</div>
        <div class="map-wrapper">
            <project-map v-on:map-init="mapInit"></project-map>
        </div>
    </div>
    <ons-row class="report-widget" v-else-if="context=='report'">
        <ons-col class="report widget-label">{{widget.label}}</ons-col>
        <ons-col class="report widget-value">{{value}}</ons-col>
    </ons-row>
</template>


<script>
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import MapboxDraw from '@mapbox/mapbox-gl-draw';

export default {
    name: 'GeojsonFeatureCollectionWidget',
    props: ['value', 'widget', 'context'],
    data() {
        return {};
    },
    methods: {
        mapInit: function(map) {
            var self = this;
            this.map = map;
            this.draw = new MapboxDraw({
                controls: {
                    'combine_features': false,
                    'uncombine_features': false
                }
            });
            this.map.addControl(this.draw, 'top-left');
            if (typeof this.value === 'object') {
                this.draw.add(this.value);
            }
            map.on('draw.create', function() {
                self.updateValue();
            });
            map.on('draw.update', function() {
                self.updateValue();
            });
            map.on('draw.delete', function() {
                self.updateValue();
            });
        },
        updateValue: function() {
            this.value = this.draw.getAll();
            this.$emit('update:value', this.value);
        }
    }
};
</script>

<style scoped>
    .map-wrapper {
        height: 260px;
    }
</style>
