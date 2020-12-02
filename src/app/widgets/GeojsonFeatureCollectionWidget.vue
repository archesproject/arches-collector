<template>
    <div v-if="value !== null">
    <div v-if="context == 'editor' || context == 'report'" style="width:100%; display:flex; flex-direction:column; padding: 10px;">
        <div class="map-controls">
            <div class="mapboxgl-ctrl mapboxgl-ctrl-group fullscreen-control">
                <button 
                    class="mapboxgl-ctrl-icon" 
                    type="button" 
                    v-on:click="toggleFullscreen" 
                    v-bind:class="{
                            'mapboxgl-ctrl-shrink': fullscreenActive,
                            'mapboxgl-ctrl-fullscreen': !fullscreenActive
                    }">
                </button>
            </div>
        </div>
        <div v-if="context=='editor'" class="editor-widget">
            <div class="editor widget-label">{{widget.label}}</div>
            <div class="editor widget-value">
                <div v-bind:class="{ fullscreen: fullscreenActive }" class="bongo">
                    <div class="map-wrapper" >
                        <project-map v-on:map-init="mapInit" :extent="bounds"></project-map>
                    </div>

                    <div v-if="!activeDrawMode" class="draw-button-container">
                        <v-ons-button 
                            class="draw-button" 
                            @click="beginDrawFeature('point')"
                        >
                            <v-ons-icon icon="fa-plus" style="padding-right: 9px;"></v-ons-icon>
                            <v-ons-icon icon="fa-map-marker" style="padding-right: 3px;"></v-ons-icon>
                            <div>Point</div>
                        </v-ons-button>
                        <v-ons-button 
                            class="draw-button"
                            style="border-left: 1px solid #bbb; border-right: 1px solid #bbb;"
                            @click="beginDrawFeature('line')"
                        >
                            <v-ons-icon icon="fa-plus" style="padding-right: 9px;"></v-ons-icon>
                            <v-ons-icon icon="fa-bezier-curve" style="padding-right: 3px;"></v-ons-icon>
                            <div>LineString</div>
                        </v-ons-button>
                        <v-ons-button 
                            class="draw-button" 
                            @click="beginDrawFeature('polygon')"
                        >
                            <v-ons-icon icon="fa-plus" style="padding-right: 9px;"></v-ons-icon>
                            <v-ons-icon icon="fa-draw-polygon" style="padding-right: 3px;"></v-ons-icon>
                            <div>Polygon</div>
                        </v-ons-button>
                    </div>
                    <div v-else-if="activeDrawMode" class="draw-button-container">
                        <v-ons-button
                            modifier="quiet"
                            @click="cancelDrawFeature"
                            style="display:flex; flex: 3; justify-content:center; padding:unset; width:50%; border-radius: unset; color: rgba(255, 0, 0, 0.8); background-color: rgba(255, 0, 0, 0.2); font-size: small;"
                        >
                            <v-ons-icon icon="fa-ban" style="display: flex; align-items: center; padding-right: 8px;"></v-ons-icon>
                            <div>Cancel</div>
                        </v-ons-button>

                        <v-ons-button 
                            modifier="cta"
                            v-if="activeDrawMode !== 'point'"
                            @click="finishDrawFeature"
                            style="display:flex; flex: 4; justify-content:center; padding:unset; width:50%; border-radius: unset; font-size: small;"
                        >
                            <v-ons-icon v-if="activeDrawMode === 'linestring'" icon="fa-bezier-curve" style="display: flex; align-items: center; padding-right: 8px;"></v-ons-icon>
                            <v-ons-icon v-else-if="activeDrawMode === 'polygon'" icon="fa-draw-polygon" style="display: flex; align-items: center; padding-right: 8px;"></v-ons-icon>

                            <div>Finish</div>
                        </v-ons-button>
                    </div>
                </div>
            </div>

            <div class="foo">
                <v-ons-list class='qux'>
                    <v-ons-list-item 
                        :id="'list-item-' + feature.id"
                        modifier="longdivider"
                        v-for="feature in foo" 
                        v-bind:key="feature.id" 
                        v-bind:class="{
                            selected: (selectedFeature && selectedFeature.id === feature.id),
                            'delete-mode': (selectedFeature && selectedFeature.id === feature.id) && deleteModeActive
                        }" 
                        @click.stop="handleListItemClick(feature);" 
                        @dragstart="handleListItemDragStart(feature);"
                        @touchmove.self.stop
                        lock-on-drag
                    >
                        <v-ons-carousel
                            :id="'carousel-' + feature.id"
                            class="center"
                            swipeable
                            overscrollable
                            auto-scroll
                            auto-scroll-ratio="0.1"
                            style="padding:10px 20px; overflow:hidden;"
                            @dragend="handleCarouselDragEnd(feature);"
                        >
                            <v-ons-carousel-item style="display:flex; align-items:center;">
                                <div style="display:flex; align-items: center;">
                                    <v-ons-button
                                        modifier="cta"
                                        class="zoom-button"
                                        v-bind:style="{
                                            'opacity': (selectedFeature && selectedFeature.id === feature.id) ? '90%' : '70%' 
                                        }"
                                        @click.stop="handleZoom(feature);"
                                    >
                                        <v-ons-icon icon="fa-search-plus"></v-ons-icon>
                                    </v-ons-button>
                                    <div 
                                        style="padding-left: 15px;"
                                        v-bind:style="{'font-weight': (selectedFeature && selectedFeature.id === feature.id) ? 'bold' : 'normal' }"
                                    >
                                        {{ feature.geometry.type }}
                                    </div>
                                </div>
                            </v-ons-carousel-item>

                            <v-ons-carousel-item style="display:flex; align-items:center;">
                                <div class="delete-container" @click.stop>
                                    <div style="width:50%;">
                                        Delete this {{ feature.geometry.type }}?
                                    </div>

                                    <div style="display: flex; width:50%; justify-content: space-between;">
                                        <v-ons-button 
                                            style="display:flex; justify-content: center; align-items: center; min-width: 80px; color:rgba(255,0,0,0.8); border-color: rgba(255,0,0,0.6); padding: unset; font-size: small; margin: 0 2px;" 
                                            modifier="outline"
                                            @click.stop="handleDeleteFeature"
                                        >
                                            <v-ons-icon style="padding-right:8px;" icon="fa-trash"></v-ons-icon>
                                            <span>YES</span>
                                        </v-ons-button>
                                        <v-ons-button 
                                            style="display:flex; justify-content: center; align-items: center; min-width: 80px; padding: unset; font-size: small; margin: 0 2px;" 
                                            modifier="cta"
                                            @click.stop="cancelDeleteFeature(feature);"
                                        >
                                            <v-ons-icon style="padding-right:8px;" icon="fa-ban"></v-ons-icon>
                                            <span>NO</span>
                                        </v-ons-button>
                                    </div>
                                </div>
                            </v-ons-carousel-item>
                        </v-ons-carousel>

                        <div
                            v-show="(selectedFeature && selectedFeature.id === feature.id) && !deleteModeActive "
                            class="right" 
                            style="position:absolute; height:100%; right:0px; color:rgba(255,0,0,0.7);"
                        >
                            <v-ons-icon 
                                v-bind:class=" /* necessary to maintain bounce with v-show on parent */ {
                                    bounce: (selectedFeature && selectedFeature.id === feature.id) && !deleteModeActive 
                                }"
                                icon="fa-caret-left"
                            ></v-ons-icon>
                            <v-ons-icon 
                                style="padding:5px; padding-right: 15px;" 
                                icon="fa-trash"
                            ></v-ons-icon>
                        </div>
                    </v-ons-list-item>
                </v-ons-list>
            </div>
        </div>
        <div v-else-if="context=='report'" class="report-widget" >
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
import geojsonExtent from '@mapbox/geojson-extent';
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
            selectedFeature: null,
            zoomActive: false,
            deleteModeActive: false,
            fullscreenActive: false,
            activeDrawMode: null,
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
                if (this.context === 'editor') {
                    if (this.draw) {
                        this.draw.set(value);
                    }
                }
                else {
                    this.map.getSource('report-data').setData(value);
                }
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
            this.draw = new MapboxDraw({
                displayControlsDefault: false,
                controls: {
                    combine_features: false,
                    uncombine_features: false,
                    trash: false
                },
                styles: drawLayers
            });

            this.map.addControl(this.draw);

            this.map.on('draw.create', () => this.updateDrawings('create'));
            this.map.on('draw.update', () => this.updateDrawings('update'));
            this.map.on('draw.delete', () => this.updateDrawings('delete'));
            this.map.on('draw.modechange', (e) => {
                /* always force simple_select */ 
                if (e.mode === 'direct_select') {
                    this.draw.changeMode('simple_select', { 
                        featureIds: this.selectedFeature ? [this.selectedFeature.id] : [],
                    });
                }
            });
            this.map.on('draw.selectionchange', (e) => {
                if (e.features.length) {

                    let carousel;

                    if (this.selectedFeature) {
                        /* reset previous carousel */ 
                        carousel = document.querySelector(`#carousel-${this.selectedFeature.id}`);
                        carousel.setActiveIndex(0);
                    }

                    const listItem = document.querySelector(`#list-item-${e.features[0].id}`);
                    listItem.scrollIntoView({behavior: "smooth", block: "center"});
                    
                    this.selectFeature(e.features[0]);

                    /* reset current carousel */ 
                    carousel = document.querySelector(`#carousel-${e.features[0].id}`);
                    carousel.setActiveIndex(0);
                } 
                else if (this.selectedFeature) {
                    this.selectFeature(this.selectedFeature);
                } 
                else {
                    this.selectFeature(null);
                }
            });

            this.draw.add(this.featureCollection);
            this.updateDrawings('init');
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
                if (e === 'selectionchange')  {
                    if (this.draw.getSelectedIds().length === 0) {
                        this.foo = fc.features;
                        this.$emit('update:value', fc);
                    }
                } 
                else if (e === 'delete') {
                    this.foo = fc.features;
                    this.$emit('update:value', fc);
                }
                else {
                    this.foo = fc.features;
                    this.$emit('update:value', fc);
                }
            } 
            else {
                console.log(fc, e);
            }
        },
        toggleFullscreen() {
            this.fullscreenActive = !this.fullscreenActive;
        },
        selectFeature(feature) {
           if ( 
               !feature /* allows null input */
               || !this.selectedFeature
               || (this.selectedFeature && this.selectedFeature.id !== feature.id) 
            ) {
                this.selectedFeature = feature;
            }

            this.activeDrawMode = null;
            this.zoomActive = false;
            this.deleteModeActive = false;
            
            /* force mapbox to highlight feature */ 
            this.draw.changeMode('simple_select', { 
                featureIds: this.selectedFeature ? [this.selectedFeature.id] : [],
            });
        },
        handleZoom(feature) {
            if (!this.selectedFeature) {
                this.handleListItemClick(feature);
                this.zoomActive = true
            }
            else if (this.selectedFeature && this.selectedFeature.id !== feature.id) {
                this.handleListItemClick(feature);
                this.zoomActive = true;
            }
            else {
                this.zoomActive = !this.zoomActive;
            }

            const selectedFeatureGeojsonExtent = geojsonExtent(this.selectedFeature);
            
            this.map.flyTo({
                bounds: selectedFeatureGeojsonExtent,
                zoom: 9,
            })

            if (this.zoomActive) { /* giving a point a bbox overrides zoom */
                this.map.fitBounds(selectedFeatureGeojsonExtent, { padding: { top: 20, right: 60, bottom: 40, left: 20 }, maxZoom: 9 });
            } 
            else { /* if zoom is already selected, let's fit the map to all features*/
                this.map.fitBounds(geojsonExtent(this.featureCollection), { padding: { top: 20, right: 60, bottom: 40, left: 20 } });
            }
        },
        handleListItemClick(feature) {
            let carousel, deleteFlag;

            if (!this.selectedFeature) {
                this.selectFeature(feature);
            } 
            else if (this.selectedFeature.id !== feature.id) {
                carousel = document.querySelector(`#carousel-${this.selectedFeature.id}`);
                carousel.setActiveIndex(0);

                this.selectFeature(feature);
            } 
            else { /* touch already selected list item */
                carousel = document.querySelector(`#carousel-${this.selectedFeature.id}`);
                
                if (carousel.getActiveIndex() === 0) {
                    this.selectFeature(null);
                } 

                this.map.fitBounds(geojsonExtent(this.featureCollection), { padding: { top: 20, right: 60, bottom: 20, left: 20 } });
            }
        },
        handleListItemDragStart(feature) {
            let carousel, deleteFlag;

            if (!this.selectedFeature) {
                this.selectFeature(feature);
            } 
            else if (this.selectedFeature.id !== feature.id) {
                /* set previous carosel to 0 index */ 
                carousel = document.querySelector(`#carousel-${this.selectedFeature.id}`);
                carousel.setActiveIndex(0);

                this.selectFeature(feature);
            }

            // GOOD BUT BUGGY
            // this.map.fitBounds(geojsonExtent(this.selectedFeature), { padding: { top: 20, right: 60, bottom: 20, left: 20 }, maxZoom: 9 });
        },
        handleCarouselDragEnd(feature) {
            /* need setTimeout here to ensure the drag motion has completed before asserting a carousel index */ 
            setTimeout(() => {
                const carousel = document.querySelector(`#carousel-${feature.id}`);
    
                if (carousel.getActiveIndex() !== 0) {
                    this.deleteModeActive = true;
                } 
                else {
                    this.deleteModeActive = false;
                }
            }, 0);
        },
        beginDrawFeature(featureType) {
            if (this.selectedFeature) {
                const carousel = document.querySelector(`#carousel-${this.selectedFeature.id}`);
                carousel.setActiveIndex(0);

                this.selectFeature(null);
            }

            let activeDrawMode;

            if (featureType === 'point') {
                this.draw.changeMode('draw_point');
                activeDrawMode = 'point';
            }
            else if (featureType === 'line') {
                this.draw.changeMode('draw_line_string');
                activeDrawMode = 'linestring';
            }
            else if (featureType === 'polygon') {
                this.draw.changeMode('draw_polygon');
                activeDrawMode = 'polygon';
            }

            /* needs this delay to keep UI happy */ 
            setTimeout(() => {
                this.activeDrawMode = activeDrawMode;
            }, 0);
        },
        cancelDrawFeature() {
            this.draw.trash();
            
            this.activeDrawMode = null;
            this.selectFeature(null);
        },
        finishDrawFeature() {
            this.activeDrawMode = null;
            this.selectFeature(null);

            setTimeout(() => {
                const newlyCreatedFeature = this.foo[(this.foo.length - 1)];
                this.selectFeature(newlyCreatedFeature);

                const listItem = document.querySelector(`#list-item-${newlyCreatedFeature.id}`);
                listItem.scrollIntoView({behavior: "smooth", block: "center"});
            }, 0);
        },
        handleDeleteFeature() {
            this.draw.trash();
            this.selectFeature(null);
            this.map.fitBounds(geojsonExtent(this.featureCollection), { padding: { top: 20, right: 60, bottom: 40, left: 20 } });
        },
        cancelDeleteFeature(feature) {
            const carousel = document.querySelector(`#carousel-${feature.id}`);
            carousel.setActiveIndex(0);

            this.deleteModeActive = false;
        },
    },
    destroyed() {
        this.draw = undefined;
        this.map = undefined;
    }
};
</script>

<style scoped>

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateX(0);
  }
  40% {
    transform: translateX(-4px);
  }
  60% {
    transform: translateX(-2px);
  }
}

.bounce {
    animation: bounce 1.5s;
    animation-iteration-count: 2;
}

.map-wrapper {
    height: 260px;
}

.editor-widget {
    /* height: 100%; */
    height: inherit;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    width: 100%;
}


.delete-mode {
    /* 
        the !important flags are neccesary to get onsen playing nicely with Vue's render logic,
        if we were to go the roundabout way of using a querySelector and manually changing
        the values the !important flags become unneccesary. However let's use Vue's more 
        graceful logic instead.
    */
    transition: 'background-color 400ms linear' !important;
    background-color: rgba(255, 0, 0, 0.2) !important;
    color: rgba(255, 0, 0, 0.8);
}

.bongo {
    display:flex; 
    flex: 1;
    flex-direction:column; 
    height:100%; 
    margin-top: 5px;
}

.draw-button-container {
    display:flex; 
    /* width:100%;  */
    box-sizing: border-box;
    border: 1px solid #bbb; 
    border-top: none;
}
.draw-button {
    padding: unset;
    border-radius: unset;
    display:flex; 
    flex: 1;
    font-size: smaller;
    align-items: center;
    justify-content: center;
    background: #eee;
    color:  rgb(31, 31, 33, 0.8);
}
.foo {
    display: flex;
    flex: 1 1 auto;
    margin-top: 10px;
    box-sizing: border-box;
    border-left: 1px solid rgb(31, 31, 33, 0.2);
    border-right: 1px solid rgb(31, 31, 33, 0.2);
}
.qux {
    width: 100%;
    overflow: scroll;
}
.list-item {
    padding: unset;
    flex-shrink: 0;
}
.selected {
    background-color: #d9d9d9;
}
.delete-container {
    width: 80vw;
    margin-left: -4px; /* workaround to keep children cenetered with onsen carousel logic */
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.zoom-button {
    padding: 0 8px;
    margin: 4px 0;
    border-radius: 50%;
}
.report-widget {
    width: 100%;
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
