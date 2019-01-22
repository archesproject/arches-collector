<template>
<div>
    <div class="map-controls">
        <div class="mapboxgl-ctrl mapboxgl-ctrl-group fullscreen-control">
            <button class="mapboxgl-ctrl-icon" type="button" v-on:click="toggleFullscreen" v-bind:class="{
                        'mapboxgl-ctrl-shrink': fullscreenActive,
                        'mapboxgl-ctrl-fullscreen': !fullscreenActive
                }"></button>
        </div>
    </div>
    <div v-if="context=='editor'">
        <div class="editor widget-label">{{widget.label}}</div>
        <div class="map-wrapper" v-bind:class="{ fullscreen: fullscreenActive }">
            <project-map v-on:map-init="mapInit" :extent="bounds"></project-map>
        </div>
    </div>
    <div class="report-widget" v-else-if="context=='report'">
        <ons-col class="report widget-label">{{widget.label}}</ons-col>
        <ons-col class="report widget-value">
            <div class="map-wrapper" v-bind:class="{ fullscreen: fullscreenActive }">
                <project-map v-on:map-init="mapInit" :extent="bounds"></project-map>
            </div>
        </ons-col>
    </div>
    <span class="flex tile-data" v-else-if="context=='nav'">
        <div v-if="!!value">{{value}}</div>
        <div v-else>no data</div>
        <div class="widget-label">{{widget.label}}</div>
    </span>
</div>
</template>

<script>
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import GenericControl from '../../assets/map/GenericControl';
import reportLayers from '../../assets/map/report_layers.json';

export default {
    name: 'GeojsonFeatureCollectionWidget',
    props: ['value', 'widget', 'context'],
    data() {
        return {
            fullscreenActive: false
        };
    },
    computed: {
        featureCollection() {
            return typeof this.value === 'object' ? this.value : {
                type: 'FeatureCollection',
                features: []
            };
        },
        bounds() {
            return this.featureCollection.features.length > 0 ?
                this.featureCollection :
                this.$store.getters.activeProject.bounds;
        }
    },
    watch: {
        featureCollection(value) {
            if (this.map) {
                if (this.context === 'editor') this.draw.set(value);
                else this.map.getSource('report-data').setData(value);
            }
        },
        fullscreenActive() {
            if (this.map) this.$nextTick(() => this.map.resize());
        }
    },
    methods: {
        mapInit(map) {
            const fullscreenEl = this.$el.querySelector('.fullscreen-control');
            this.map = map;
            map.addControl(new GenericControl(fullscreenEl));
            if (this.context === 'editor') this.initDraw();
            else this.initReport();
        },
        initDraw() {
            this.draw = new MapboxDraw({
                controls: {
                    'combine_features': false,
                    'uncombine_features': false
                }
            });
            this.map.addControl(this.draw, 'top-left');
            this.draw.add(this.featureCollection);
            this.map.on('draw.render', () => this.updateDrawings());
        },
        initReport() {
            let style = this.map.getStyle();
            style.sources['report-data'] = {
                'type': 'geojson',
                'data': this.featureCollection
            };
            style.layers.push(...reportLayers);
            this.map.setStyle(style);
        },
        updateDrawings() {
            this.$emit('update:value', this.draw.getAll());
        },
        toggleFullscreen() {
            this.fullscreenActive = !this.fullscreenActive;
        }
    },
    destroyed() {
        this.draw = undefined;
        this.map = undefined;
    }
};
</script>

<style scoped>
.map-wrapper {
    height: 260px;
}

.report .map-wrapper {
    margin-top: 5px;
    margin-right: 20px;
}

.fullscreen.map-wrapper {
    height: auto;
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    z-index: 10;
    margin: 0;
}

.map-controls {
    display: none;
}
</style>
