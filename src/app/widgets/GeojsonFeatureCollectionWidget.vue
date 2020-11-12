<template>
    <div v-if="value !== null">
    <div v-if="context == 'editor' || context == 'report'" style="width:100vw; display:flex;">
        <div class="map-controls">
            <div class="mapboxgl-ctrl mapboxgl-ctrl-group fullscreen-control">
                <button class="mapboxgl-ctrl-icon" type="button" v-on:click="toggleFullscreen" v-bind:class="{
                            'mapboxgl-ctrl-shrink': fullscreenActive,
                            'mapboxgl-ctrl-fullscreen': !fullscreenActive
                    }"></button>
            </div>
            <div class="mapboxgl-ctrl-group mapboxgl-ctrl delete-control">
                <button class="mapbox-gl-draw_ctrl-draw-btn mapbox-gl-draw_trash" title="Delete" v-on:click="toggleDelete"></button>
            </div>
        </div>
        <div v-if="context=='editor'" class="quux">
            <div class="editor widget-label">{{widget.label}}</div>
            <div class="editor widget-value">
                <div class="map-wrapper" v-bind:class="{ fullscreen: fullscreenActive }">
                    <project-map v-on:map-init="mapInit" :extent="bounds"></project-map>
                </div>
            </div>

            <div class='qux'>
                <div v-for="bar in foo" v-bind:key="bar.id">
                    {{ bar }}
                </div>
            </div>





        </div>
        <div class="report-widget" v-else-if="context=='report'">
            <v-ons-col class="report widget-label">{{widget.label}}</v-ons-col>
            <v-ons-col class="report widget-value">
                <div class="map-wrapper" v-bind:class="{ fullscreen: fullscreenActive }">
                    <project-map v-on:map-init="mapInit" :extent="bounds"></project-map>
                </div>
            </v-ons-col>
        </div>
    </div>
    <span class="flex tile-data" v-else-if="context=='nav'">
        <div v-if="!!displayValue">{{displayValue}}</div>
        <div v-else>no data</div>
        <div class="widget-label">{{widget.label}}</div>
    </span>
    </div>
</template>

<script>
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import GenericControl from '../../assets/map/GenericControl';
import reportLayers from '../../assets/map/report_layers.json';
import drawLayers from '../../assets/map/draw_layers.json';

export default {
    name: 'GeojsonFeatureCollectionWidget',
    props: ['value', 'widget', 'context', 'tile'],
    data() {
        return {
            foo: [],
            fullscreenActive: false,
            deleteActive: false
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
            return this.featureCollection &&
                this.featureCollection.features.length > 0
                ? this.featureCollection
                : this.$store.getters.activeProject.bounds;
        },
        displayValue: function() {
            var count = this.featureCollection.features.length;
            if (count > 0) {
                return `${count} feature${count > 1 ? 's' : ''} in FeatureCollection`;
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
        },
    },
    methods: {
        mapInit(map) {
            const fullscreenEl = this.$el.querySelector('.fullscreen-control');
            const tileFilter = ['!=', 'tileid', this.tile.tileid];
            this.map = map;
            map.setFilter('resource-point', ['all', ['==', '$type', 'Point'], tileFilter]);
            map.setFilter('resource-polygon', ['all', ['==', '$type', 'Polygon'], tileFilter]);
            map.setFilter('resource-line', tileFilter);
            map.addControl(new GenericControl(fullscreenEl));
            if (this.context === 'editor') this.initDraw();
            else this.initReport();
        },
        initDraw() {
            const deleteEl = this.$el.querySelector('.delete-control');
            this.draw = new MapboxDraw({
                controls: {
                    combine_features: false,
                    uncombine_features: false,
                    trash: false
                },
                styles: drawLayers
            });
            this.map.addControl(this.draw, 'top-left');
            this.draw.add(this.featureCollection);
            this.map.addControl(new GenericControl(deleteEl), 'top-left');
            this.map.on('draw.delete', () => this.updateDrawings('delete'));
            this.map.on('draw.create', () => this.updateDrawings('create'));
            this.map.on('draw.update', () => this.updateDrawings('update'));
            this.map.on('draw.selectionchange', (e) => {
                const mode = this.draw.getMode();
                if (this.deleteActive) {
                    if (e.features) {
                        const fc = this.draw.getAll();
                        const features = [];
                        const featureIds = e.features.map((feature) => {
                            return feature.id;
                        });
                        fc.features.forEach((feature) => {
                            if (featureIds.indexOf(feature.id) < 0) {
                                features.push(feature);
                            }
                        });
                        fc.features = features;
                        this.draw.set(fc);
                    }
                    this.toggleDelete();
                }
                this.updateDrawings('selectionchange');
                if (mode === 'simple_select' || mode === 'direct_select') {
                    this.draw.changeMode('simple_select');
                }
            });
            this.map.on('draw.modechange', (e) => {
                if (e.mode === 'simple_select' || e.mode === 'direct_select') {
                    this.draw.changeMode('simple_select');
                } else if (this.deleteActive) {
                    this.toggleDelete();
                }
            });
        },
        initReport() {
            const style = this.map.getStyle();
            style.sources['report-data'] = {
                type: 'geojson',
                data: this.featureCollection
            };
            style.layers.push(...reportLayers);
            this.map.setStyle(style);
        },
        checkIfFeatureIsValid(fc) {
            var valid;
            var invalidFeatures = fc.features.filter(function(feature) {
                var geom = feature.geometry;
                if (
                    (geom.type === 'Point' && !geom.coordinates) ||
                    (geom.type === 'Linestring' && geom.coordinates.length === 0) ||
                    (geom.type === 'Polygon' && geom.coordinates[0].length === 1)
                ) {
                    return feature;
                }
            });
            valid = invalidFeatures.length === 0;
            return valid;
        },
        updateDrawings(e) {
            var fc = this.draw.getAll();
            var featuresValid = this.checkIfFeatureIsValid(fc);
            if (featuresValid === true) {
                if (e === 'selectionchange') {
                    if (this.draw.getSelectedIds().length === 0) {
                        this.$emit('update:value', fc);
                    }
                } else {



                    console.log(this.foo, e, fc)

                    this.foo = fc.features;

                    // for (let feature of fc.features) {

                    // };



                    this.$emit('update:value', fc);
                }
            } else {
                console.log(fc, e);
            }
        },
        toggleFullscreen() {
            this.fullscreenActive = !this.fullscreenActive;
        },
        toggleDelete() {
            this.deleteActive = !this.deleteActive;
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
    padding: 10px 0px;
}



.quux {
    /* height: 100%; */
    height: inherit;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    width: 100%;
}
.qux {
    /* max-height: calc(ini); */
    overflow: scroll;
    /* flex-shrink: 0; */
    display: flex;
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
    color: #888;
    margin-left: -5px;
    padding-left: 5px;
}

.tile-data .widget-label {
    color: #271F4C;
    font-size: 13px;
}
</style>
