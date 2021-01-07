<template>
    <div v-if="value !== null">
    <div v-if="context == 'editor' || context == 'report'">
        <div class="mapboxgl-ctrl mapboxgl-ctrl-group fullscreen-control">
            <button 
                type="button"
                v-if="map"
                v-on:click="toggleFullscreen" 
                v-bind:class="{
                    'mapboxgl-ctrl-shrink': fullscreenActive,
                    'mapboxgl-ctrl-fullscreen': !fullscreenActive
                }"
            >
                <v-ons-icon 
                    v-if="!fullscreenActive"
                    size="14px"
                    icon="fa-expand-arrows-alt"
                ></v-ons-icon>
                <v-ons-icon 
                    v-else 
                    size="14px"
                    icon="fa-compress-arrows-alt"
                ></v-ons-icon>
            </button>
        </div>
        <div v-if="context=='editor'" class="editor-widget">
            <div class="editor widget-label">{{widget.label}}</div>
            <div class="editor widget-value">
                <div v-bind:class="{ fullscreen: fullscreenActive }">
                    <div class="map-wrapper">
                        <project-map v-on:map-init="mapInit" v-on:map-load="resetDefaultData" :extent="bounds"></project-map>
                    </div>

                    <div v-if="!activeDrawMode" class="draw-button-container">
                        <v-ons-button 
                            class="draw-button" 
                            @click="beginDrawFeature('point')"
                        >
                            <v-ons-icon icon="fa-plus" style="padding-right: 8px;"></v-ons-icon>
                            <v-ons-icon icon="fa-map-marker" style="padding-right: 4px;"></v-ons-icon>
                            <div>Point</div>
                        </v-ons-button>
                        <v-ons-button 
                            class="draw-button"
                            style="border-left: 1px solid #bbb; border-right: 1px solid #bbb;"
                            @click="beginDrawFeature('line')"
                        >
                            <v-ons-icon icon="fa-plus" style="padding-right: 8px;"></v-ons-icon>
                            <v-ons-icon icon="fa-bezier-curve" style="padding-right: 4px;"></v-ons-icon>
                            <div>LineString</div>
                        </v-ons-button>
                        <v-ons-button 
                            class="draw-button" 
                            @click="beginDrawFeature('polygon')"
                        >
                            <v-ons-icon icon="fa-plus" style="padding-right: 8px;"></v-ons-icon>
                            <v-ons-icon icon="fa-draw-polygon" style="padding-right: 4px;"></v-ons-icon>
                            <div>Polygon</div>
                        </v-ons-button>
                    </div>
                    <div v-else-if="activeDrawMode" class="draw-button-container">
                        <v-ons-button
                            modifier="quiet"
                            class="draw-control-button"
                            @click="cancelDrawFeature"
                            style="flex: 3; color: rgba(255, 0, 0, 0.8); background-color: rgba(255, 0, 0, 0.2);"
                        >
                            <v-ons-icon icon="fa-ban" style="display: flex; align-items: center; padding-right: 8px;"></v-ons-icon>
                            <div>Cancel</div>
                        </v-ons-button>

                        <v-ons-button 
                            modifier="cta"
                            class="draw-control-button"
                            style="flex: 4;"
                            v-if="activeDrawMode !== 'point'"
                            @click="finishDrawFeature"
                        >
                            <v-ons-icon 
                                v-if="activeDrawMode === 'linestring'" 
                                icon="fa-bezier-curve" 
                                style="display: flex; align-items: center; padding-right: 8px;"
                            >
                            </v-ons-icon>
                            <v-ons-icon 
                                v-else-if="activeDrawMode === 'polygon'" 
                                icon="fa-draw-polygon" 
                                style="display: flex; align-items: center; padding-right: 8px;">
                            </v-ons-icon>

                            <div>Finish</div>
                        </v-ons-button>
                    </div>
                </div>

                <v-ons-list 
                    class='feature-list'
                    @touchmove.self.stop
                >
                    <v-ons-list-item 
                        :id="'list-item-' + feature.id"
                        modifier="longdivider"
                        v-for="feature in features" 
                        v-bind:key="feature.id" 
                        v-bind:class="{
                            selected: selectedFeatureId === feature.id,
                            'delete-mode': shouldShowDeleteMode(feature.id)
                        }" 
                        @click.stop="handleListItemClick(feature.id);" 
                        @dragstart="selectFeature(feature.id);"
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
                            @dragstart="handleCarouselDragStart(feature.id);"
                            @dragend="handleCarouselDragEnd(feature.id);"
                        >
                            <v-ons-carousel-item style="display:flex; align-items:center;">
                                <div class="feature-info-container">
                                    <v-ons-fab
                                        modifier="mini"
                                        v-bind:style="{
                                            'opacity': selectedFeatureId === feature.id ? '90%' : '70%',
                                            'background-color': shouldShowActiveZoom(feature.id) ? 'rgba(255, 0, 0, 0.2)' : 'rgba(37,166,217,1)'
                                        }"
                                        @click.stop="handleZoomClick(feature.id);"
                                    >
                                        <v-ons-icon 
                                            v-if="shouldShowActiveZoom(feature.id)"
                                            size="20px"
                                            icon="fa-search-minus"
                                        ></v-ons-icon>
                                        <v-ons-icon 
                                            v-else 
                                            size="20px"
                                            icon="fa-search-plus"
                                        ></v-ons-icon>
                                    </v-ons-fab>
                                    <div 
                                        style="padding-left: 25px;"
                                        v-bind:style="{'font-weight': selectedFeatureId === feature.id ? 'bold' : 'normal'}"
                                    >
                                        {{ feature.geometry.type }}
                                    </div>
                                </div>
                            </v-ons-carousel-item>

                            <v-ons-carousel-item style="display:flex; align-items:center;">
                                <div class="feature-info-container delete-controls-container" @click.stop>
                                    <div style="width:50%;">
                                        Delete this {{ feature.geometry.type }}?
                                    </div>

                                    <div class="delete-button-container">
                                        <v-ons-button
                                            class="feature-control-button"
                                            style="color:rgba(255,0,0,0.8); border-color: rgba(255,0,0,0.6);" 
                                            modifier="outline"
                                            @click.stop="handleDeleteFeature"
                                        >
                                            <v-ons-icon style="padding-right:8px;" icon="fa-trash"></v-ons-icon>
                                            <span>YES</span>
                                        </v-ons-button>
                                        <v-ons-button 
                                            class="feature-control-button"
                                            modifier="cta"
                                            @click.stop="cancelDeleteFeature(feature.id);"
                                        >
                                            <v-ons-icon style="padding-right:8px;" icon="fa-ban"></v-ons-icon>
                                            <span>NO</span>
                                        </v-ons-button>
                                    </div>
                                </div>
                            </v-ons-carousel-item>
                        </v-ons-carousel>

                        <div
                            v-show="(selectedFeatureId === feature.id) && !deleteModeActive && !fullscreenActive"
                            class="delete-icon-container right" 
                            @click.stop="handleDeleteIconClick(feature.id)"
                            @dragstart.stop.prevent
                            @dragend.stop="handleDeleteIconClick(feature.id)"
                        >
                            <v-ons-icon 
                                v-bind:class=" /* necessary to maintain bounce with v-show on parent */ {
                                    bounce: (selectedFeatureId === feature.id) && !deleteModeActive 
                                }"
                                icon="fa-caret-left"
                                size="18px"
                                style="margin-right: 8px;"
                            ></v-ons-icon>
                            <v-ons-icon 
                                size="18px"
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
                    <project-map v-on:map-init="mapInit" v-on:map-load="resetDefaultData" :extent="bounds"></project-map>
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
            features: [],
            selectedFeatureId: null,
            zoomActive: false,
            deleteModeActive: false,
            fullscreenActive: false,
            activeDrawMode: null,
        };
    },
    destroyed() {
        this.draw = undefined;
        this.map = undefined;
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
        },
    },
    watch: {
        featureCollection(value) {
            if (value && this.map) {
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
        resetDefaultData() {
            this.selectedFeatureId = null;
            this.zoomActive = false;
            this.deleteModeActive = false;
            this.activeDrawMode = null;
            this.fullscreenActive = false;
        },
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

            this.map.on('dragstart', () => {
                this.zoomActive = false;
            });

            this.map.on('draw.create', () => this.updateDrawings('create'));
            this.map.on('draw.update', () => this.updateDrawings('update'));
            this.map.on('draw.delete', () => this.updateDrawings('delete'));
            this.map.on('draw.modechange', (e) => {
                /* always force simple_select */ 
                if (e.mode === 'direct_select') {
                    this.draw.changeMode('simple_select', { 
                        featureIds: this.selectedFeatureId ? [this.selectedFeatureId] : [],
                    });
                }
            });
            this.map.on('draw.selectionchange', (e) => {
                if (e.features.length) { /* mostly used for tapping map features */
                    this.selectFeature(e.features[0].id);
                    this.scrollListItemIntoView(e.features[0].id);
                } 
                else if (this.selectedFeatureId) { /* keeps feature selected throughout map scroll */
                    this.selectFeature(this.selectedFeatureId);
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
                    (geom.type === 'Point' && !geom.coordinates)
                    || (geom.type === 'Linestring' && geom.coordinates.length === 0)
                    || (geom.type === 'Polygon' && geom.coordinates[0].length === 1)
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
                        this.features = fc.features;
                        this.$emit('update:value', fc);
                    }
                }
                else {
                    this.features = fc.features;
                    this.$emit('update:value', fc);
                }
            } 
            else {
                console.warn(fc, e);
            }
        },
        toggleFullscreen() {
            this.fullscreenActive = !this.fullscreenActive;
        },
        selectFeature(featureId) {
            /* reset carousel of previously selected feature */ 
            if (this.selectedFeatureId && this.selectedFeatureId !== featureId) {
                this.resetCarousel(this.selectedFeatureId)
            }

            if (
                !this.selectedFeatureId
                || this.selectedFeatureId !== featureId
            ) {
                this.selectedFeatureId = featureId;
                this.zoomActive = false;
                this.deleteModeActive = false;
            }
            
            this.activeDrawMode = null;

            /* force mapbox to highlight feature */ 
            this.draw.changeMode('simple_select', { 
                featureIds: this.selectedFeatureId ? [this.selectedFeatureId] : [],
            });
        },
        deselectFeature() {
            /* reset carousel of previously selected feature */ 
            if (this.selectedFeatureId) {
                this.resetCarousel(this.selectedFeatureId)
            }

            this.selectedFeatureId = null;
            this.zoomActive = false;
            this.deleteModeActive = false;
            this.activeDrawMode = null;

            /* roundabout way to create valid feature from current geometry */ 
            this.draw.changeMode('simple_select', { 
                featureIds: [],
            });
        },
        shouldShowActiveZoom(featureId) {
            if (this.zoomActive && this.selectedFeatureId === featureId) {
                return true;
            }
            return false;
        },
        zoomToFeature(featureId) {
            const feature = this.features.find(feature => {
                return feature.id === featureId;
            })

            this.zoomActive = true;

            this.map.flyTo({
                bounds: geojsonExtent(feature),
            })

            this.map.fitBounds(
                geojsonExtent(feature), 
                { 
                    padding: { top: 20, right: 60, bottom: 40, left: 20 }, 
                    maxZoom: 15,
                }
            );
        },
        zoomToFeatureCollection() {
            this.zoomActive = false;

            this.map.fitBounds(
                geojsonExtent(this.bounds), 
                { 
                    padding: { top: 20, right: 60, bottom: 40, left: 20 }, 
                    maxZoom: 15,
                }
            );
        },
        handleZoomClick(featureId) {
            if (this.selectedFeatureId === featureId) { 
                if (this.zoomActive) {
                    this.zoomToFeatureCollection()
                }
                else {
                    this.zoomToFeature(featureId);
                }
            }
            else {
                this.selectFeature(featureId);
                this.zoomToFeature(featureId)
            }
        },
        scrollListItemIntoView(featureId) {
            const listItem = document.querySelector(`#list-item-${featureId}`);
            listItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        },
        handleListItemClick(featureId) {
            if (!this.selectedFeatureId || this.selectedFeatureId !== featureId) {
                this.selectFeature(featureId);
            } 
            else { /* click already selected list item */
                const carousel = document.querySelector(`#carousel-${this.selectedFeatureId}`);
                
                if (carousel.getActiveIndex() === 0) {
                    this.deselectFeature();
                    this.zoomToFeatureCollection();
                } 
            }
        },
        resetCarousel(featureId) {
            const carousel = document.querySelector(`#carousel-${featureId}`);

            if (carousel && carousel.getActiveIndex() === 1) {
                carousel.setActiveIndex(0);
            }
        },
        handleCarouselDragStart(featureId) {
            const carousel = document.querySelector(`#carousel-${featureId}`);

            if (carousel.getActiveIndex() === 1) {
                this.zoomToFeature(featureId);
            } 
        },
        handleCarouselDragEnd(featureId) {
            this.$nextTick(() => {
                this.selectFeature(featureId);
                
                const carousel = document.querySelector(`#carousel-${featureId}`);
    
                if (carousel.getActiveIndex() === 1) {
                    this.deleteModeActive = true;
                    this.zoomToFeature(featureId);
                } 
                else {
                    this.deleteModeActive = false;
                }
            });
        },
        beginDrawFeature(featureType) {
            this.deselectFeature();

            if (featureType === 'point') {
                this.draw.changeMode('draw_point');
                this.activeDrawMode = 'point';
            }
            else if (featureType === 'line') {
                this.draw.changeMode('draw_line_string');
                this.activeDrawMode = 'linestring';
            }
            else if (featureType === 'polygon') {
                this.draw.changeMode('draw_polygon');
                this.activeDrawMode = 'polygon';
            }
        },
        cancelDrawFeature() {
            this.draw.trash();
            this.deselectFeature();
        },
        finishDrawFeature() {
            this.deselectFeature();

            this.$nextTick(() => {
                const feature = this.features[(this.features.length - 1)];
                this.selectFeature(feature.id);
                this.scrollListItemIntoView(feature.id)
            });
        },
        shouldShowDeleteMode(featureId) {
            if (
                this.selectedFeatureId === featureId
                && this.deleteModeActive
            ) {
                return true;
            }

            return false;
        },
        handleDeleteIconClick(featureId){
            this.selectFeature(featureId);

            const carousel = document.querySelector(`#carousel-${featureId}`);
            carousel.setActiveIndex(1);

            this.deleteModeActive = true;
            this.zoomToFeature(featureId);
        },
        handleDeleteFeature() {
            this.draw.trash();

            this.selectedFeatureId = null;  /* prevents `deselectFeature` from resetting nonexistent carousel */
            this.deselectFeature();
            this.zoomToFeatureCollection();
        },
        cancelDeleteFeature(featureId) {
            this.resetCarousel(featureId)
            this.deleteModeActive = false;
        },
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
    width: 100%;
}

.editor-widget {
    width: 100%;
    height: 100%;
    overflow: hidden;
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

.draw-button-container {
    display:flex; 
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
.draw-control-button {
    display: flex;
    justify-content:center; 
    padding:unset; 
    width:50%; 
    border-radius: unset; 
    font-size: small;
}
.feature-list {
    margin-top: 10px;
    max-height: 25vh;
    width: 100%;
    overflow-y: scroll;
}
.feature-control-button {
    display:flex;
    flex: 1;
    justify-content: center; 
    align-items: center; 
    min-width: 80px; 
    padding: unset; 
    font-size: small; 
    margin: 0 2px;
}
.list-item {
    padding: unset;
    flex-shrink: 0;
}
.selected {
    background-color: #d9d9d9;
}
.feature-info-container {
    width: 80vw; 
    display:flex; 
    align-items: center;
}
.delete-controls-container {
    margin-left: -5px; /* workaround to keep children cenetered with onsen carousel logic */
    justify-content: space-between;
}
.delete-icon-container {
    position: absolute; 
    z-index: 10; 
    height: 100%; 
    right: 10px; 
    color: rgba(255,0,0,0.7);
}
.delete-button-container {
    display: flex; 
    width:50%; 
    justify-content: space-between;
}
.zoom-button {
    padding: 0 12px;
    border-radius: 50%;
}
.report-widget {
    width: 100%;
    padding-right: 20px;
}

.report .map-wrapper {
    margin-top: 5px;
    margin-right: 20px;
}

.fullscreen {
    height: auto;
    position: absolute;
    display: flex;
    flex-direction: column;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
    z-index: 10;
    margin: 0;
}

.fullscreen .map-wrapper {
    height: 100%;
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
