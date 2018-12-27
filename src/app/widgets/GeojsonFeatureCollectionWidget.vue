<template>
    <div>
        <div class="fullscreen-control">
            <div class="mapboxgl-ctrl mapboxgl-ctrl-group">
                <button class="mapboxgl-ctrl-icon" type="button"
                    v-on:click="toggleFullscreen" v-bind:class="{
                        'mapboxgl-ctrl-shrink': fullscreenActive,
                        'mapboxgl-ctrl-fullscreen': !fullscreenActive
                }"></button>
            </div>
        </div>
        <div v-if="context=='editor'">
            <div class="editor widget-label">{{widget.label}}</div>
            <div class="map-wrapper" v-bind:class="{
                fullscreen: fullscreenActive
            }">
                <project-map v-on:map-init="mapInit" :extent="bounds">
                </project-map>
            </div>
        </div>
        <div class="report-widget" v-else-if="context=='report'">
            <ons-col class="report widget-label">{{widget.label}}</ons-col>
            <ons-col class="report widget-value">
                <div class="map-wrapper" v-bind:class="{
                    fullscreen: fullscreenActive
                }">
                    <project-map v-on:map-init="mapInit" :extent="bounds">
                    </project-map>
                </div>
            </ons-col>
        </div>
    </div>
</template>


<script>
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import MapboxDraw from '@mapbox/mapbox-gl-draw';

const mapboxgl = window.mapboxgl;

class FullscreenControl {
    constructor(container) {
        this._container = container;
    }
    onAdd() {
        return this._container;
    }
    onRemove() {
        this._container.parentNode.removeChild(this._container);
    }
}

export default {
    name: 'GeojsonFeatureCollectionWidget',
    props: ['value', 'widget', 'context'],
    data() {
        return { fullscreenActive: false };
    },
    computed: {
        featureCollection() {
            return typeof this.value === 'object' ? this.value : {
                type: 'FeatureCollection',
                features: []
            };
        },
        bounds() {
            const bounds = this.$store.getters.activeProject.bounds;
            const fc = this.featureCollection;
            return fc.features.length > 0 ? fc : bounds;
        }
    },
    watch: {
        featureCollection: function(value) {
            if (this.map) {
                if (this.context === 'editor') {
                    this.draw.set(this.featureCollection);
                } else {
                    let source = this.map.getSource('report-data');
                    source.setData(this.featureCollection);
                }
            }
        }
    },
    methods: {
        mapInit(map) {
            this.map = map;
            map.addControl(new FullscreenControl(
                this.$el.querySelector('.fullscreen-control div')
            ));
            if (this.context === 'editor') {
                this.draw = new MapboxDraw({
                    controls: {
                        'combine_features': false,
                        'uncombine_features': false
                    }
                });
                this.map.addControl(this.draw, 'top-left');
                this.draw.add(this.featureCollection);
                map.on('draw.render', () => {
                    this.$emit('update:value', this.draw.getAll());
                });
            } else {
                const color = '#3bb2d0';
                let style = map.getStyle();
                style.sources['report-data'] = {
                    'type': 'geojson',
                    'data': this.featureCollection
                };
                style.layers.push({
                    'id': 'report-fill',
                    'type': 'fill',
                    'source': 'report-data',
                    'paint': {
                        'fill-color': color,
                        'fill-opacity': 0.1
                    },
                    "filter": ["==", "$type", "Polygon"]
                }, {
                    'id': 'report-line',
                    'type': 'line',
                    'source': 'report-data',
                    'paint': {
                        'line-color': color,
                        'line-width': 2
                    }
                }, {
                    'id': 'report-circle',
                    'type': 'circle',
                    'source': 'report-data',
                    'paint': {
                        'circle-color': color,
                        'circle-radius': 3,
                        'circle-stroke-width': 2,
                        'circle-stroke-color': 'white'
                    },
                    "filter": ["==", "$type", "Point"]
                });
                map.setStyle(style);
            }
        },
        toggleFullscreen() {
            this.fullscreenActive = !this.fullscreenActive;
            setTimeout(() => {
                this.map.resize();
            }, 10);
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
    .fullscreen-control {
        display: none;
    }
</style>
