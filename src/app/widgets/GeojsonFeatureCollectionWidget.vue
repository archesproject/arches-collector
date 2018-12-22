<template>
    <div v-if="context=='editor'">
        <div class="editor widget-label">{{widget.label}}</div>
        <div class="map-wrapper" v-bind:class="{fullscreen: fullscreenActive}">
            <project-map v-on:map-init="mapInit" :extent="bounds"></project-map>
        </div>
        <div class="fullscreen-control-template">
            <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
                <button class="mapboxgl-ctrl-icon mapboxgl-ctrl-fullscreen" type="button" v-on:click="toggleFullscreen"></button>
            </div>
        </div>
    </div>
    <div class="report-widget" v-else-if="context=='report'">
        <ons-col class="report widget-label">{{widget.label}}</ons-col>
        <ons-col class="report widget-value">
            <div class="map-wrapper" v-bind:class="{fullscreen: fullscreenActive}">
                <project-map v-on:map-init="mapInit" :extent="bounds"></project-map>
                <div class="fullscreen-control-template">
                    <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
                        <button class="mapboxgl-ctrl-icon mapboxgl-ctrl-fullscreen" type="button" v-on:click="toggleFullscreen"></button>
                    </div>
                </div>
            </div>
        </ons-col>
    </div>
</template>


<script>
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import MapboxDraw from '@mapbox/mapbox-gl-draw';

const mapboxgl = window.mapboxgl;

export default {
    name: 'GeojsonFeatureCollectionWidget',
    props: ['value', 'widget', 'context'],
    data() {
        var bounds = this.$store.getters.activeProject.bounds;
        if (typeof this.value === 'object') {
            bounds = this.value;
        }
        return {
            bounds: bounds,
            fullscreenActive: false
        };
    },
    methods: {
        mapInit: function(map) {
            var self = this;

            class FullscreenControl {
                onAdd(map) {
                    this._map = map;
                    this._container = self.$el.querySelector('.fullscreen-control-template div');
                    return this._container;
                }

                onRemove() {
                    this._container.parentNode.removeChild(this._container);
                    this._map = undefined;
                }
            }

            this.map = map;
            map.addControl(new FullscreenControl());
            if (this.context=='editor') {
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
            } else {
                var value = this.value
                if (typeof value !== 'object') {
                    value = {
                        type: 'FeatureCollection',
                        features: []
                    };
                }
                map.addSource('report-data', {
                    'type': 'geojson',
                    'data': value
                })
                map.addLayer({
                    'id': 'report-fill',
                    'type': 'fill',
                    'source': 'report-data',
                    'paint': {
                        'fill-color': 'rgb(0, 169, 208)',
                        'fill-opacity': 0.1
                    }
                });
                map.addLayer({
                    'id': 'report-line',
                    'type': 'line',
                    'source': 'report-data',
                    'paint': {
                        'line-color': 'rgb(0, 169, 208)',
                        'line-width': 2
                    }
                });
                map.addLayer({
                    'id': 'report-circle',
                    'type': 'circle',
                    'source': 'report-data',
                    'paint': {
                        'circle-color': 'rgb(0, 169, 208)'
                    },
                    "filter": ["==", "$type", "Point"]
                });
            }
        },
        updateValue: function() {
            this.value = this.draw.getAll();
            this.$emit('update:value', this.value);
        },
        toggleFullscreen: function() {
            var self = this;
            this.fullscreenActive = !this.fullscreenActive;
            setTimeout(function() {
                self.map.resize();
            }, 100);
        }
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
</style>
