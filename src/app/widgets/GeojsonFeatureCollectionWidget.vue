<template>
    <div v-if="context == 'editor' || context == 'report'">
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
    </div>
    <span class="flex tile-data" v-else-if="context=='nav'">
        <div v-if="!!displayValue">{{displayValue}}</div>
        <div v-else>no data</div>
        <div class="widget-label">{{widget.label}}</div>
    </span>
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
        },
        displayValue: function() {
            var count = this.featureCollection.features.length;
            var plural = this.featureCollection.features.length > 1;
            if (count > 0) {
                return count + ' feature' + (plural ? 's' : '') + ' in FeatureCollection'
            } else {
                return null;
            }
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
            this.map.on('draw.delete', () => this.updateDrawings('delete'));
            this.map.on('draw.create', () => this.updateDrawings('create'));
            this.map.on('draw.update', () => this.updateDrawings('update'));
            this.map.on('draw.selectionchange', () => this.updateDrawings('selectionchange'));
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
        checkIfFeatureIsValid(fc) {
            var valid;
            var invalidFeatures = fc.features.filter(function(feature){
                var geom = feature.geometry;
                if (
                    (geom.type === 'Point' && !geom.coordinates) ||
                    (geom.type === 'Linestring' && geom.coordinates.length === 0) ||
                    (geom.type === 'Polygon' && geom.coordinates[0].length === 1)
                ) {
                    return feature
                }
            });
            valid = invalidFeatures.length === 0 ? true : false;
            return valid;
        },
        updateDrawings(e) {
            var fc = this.draw.getAll();
            var featuresValid = this.checkIfFeatureIsValid(fc);
            if (featuresValid===true) {
                if (e === 'selectionchange') {
                    if (this.draw.getSelectedIds().length === 0) {
                        this.$emit('update:value', fc);
                    }
                } else {
                    this.$emit('update:value', fc);
                }
            } else {
                console.log(fc, e)
            }
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

.tile-data {
    background: #fafafa;
    color: #888;
    margin-left: -5px;
    padding-left: 5px;
}

.tile-data .widget-label {
    color: #271F4C;
    font-size: 13px;
    padding-bottom: 10px;
}
</style>
