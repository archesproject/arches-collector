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

                    <div v-if="!drawActive" class="draw-button-container">
                        <v-ons-button 
                            class="draw-button" 
                            @click="handleDrawFeature('point')"
                        >
                            <v-ons-icon icon="fa-plus" style="padding-right: 9px;"></v-ons-icon>
                            <v-ons-icon icon="fa-map-marker" style="padding-right: 3px;"></v-ons-icon>
                            <div>Point</div>
                        </v-ons-button>
                        <v-ons-button 
                            class="draw-button"
                            style="border-left: 1px solid #bbb; border-right: 1px solid #bbb;"
                            @click="handleDrawFeature('line')"
                        >
                            <v-ons-icon icon="fa-plus" style="padding-right: 9px;"></v-ons-icon>
                            <v-ons-icon icon="fa-bezier-curve" style="padding-right: 3px;"></v-ons-icon>
                            <div>LineString</div>
                        </v-ons-button>
                        <v-ons-button 
                            class="draw-button" 
                            @click="handleDrawFeature('polygon')"
                        >
                            <v-ons-icon icon="fa-plus" style="padding-right: 9px;"></v-ons-icon>
                            <v-ons-icon icon="fa-draw-polygon" style="padding-right: 3px;"></v-ons-icon>
                            <div>Polygon</div>
                        </v-ons-button>
                    </div>
                    <div v-else-if="drawActive" style="display:flex;">
                        <v-ons-button style="display:flex; justify-content:center; padding:unset; width:50%;" disabled>
                            Undo
                        </v-ons-button>

                        <v-ons-button 
                            @click="handleFinishFeature"
                            style="display:flex; justify-content:center; padding:unset; width:50%;"
                        >
                            Finish
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
                        :class="{selected: (selectedFeature && selectedFeature.id === feature.id) }" 
                        @click="handleListItemClick(feature);" 
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
                            style="padding:10px; overflow:hidden;"
                            @dragend="handleFOO(feature);"
                        >
                            <v-ons-carousel-item style="display:flex; align-items:center;">
                                <div style="display:flex; align-items: center; width: 50vw;">
                                    <v-ons-button
                                        class="geometry-button"
                                        v-bind:class="{
                                            'blue': (selectedFeature && selectedFeature.id === feature.id) && zoomClicked
                                        }"
                                        @click.stop="handleZoom(feature);"
                                    >
                                        <v-ons-icon class="geomtery-button-icon" icon="fa-search-plus"></v-ons-icon>
                                    </v-ons-button>
                                    <div style="padding-left: 20px;">
                                        {{ feature.geometry.type }}
                                    </div>
                                </div>
                            </v-ons-carousel-item>

                            <v-ons-carousel-item style="display:flex; align-items:center;">
                                <div class="delete-container" @click.stop>
                                    <div style="width:50%;">
                                        Delete this {{ feature.geometry.type }}?
                                    </div>

                                    <div style="width:50%;">
                                        <v-ons-button 
                                            style="min-width: 80px;" 
                                            modifier="outline"
                                            @click.stop="handleDeleteFeature();"
                                        >
                                            <v-ons-icon style="padding-right:5px;" icon="fa-trash"></v-ons-icon>
                                            <span>YES</span>
                                        </v-ons-button>
                                        <v-ons-button 
                                            style="min-width: 80px;" 
                                            modifier="cta"
                                            @click.stop="cancelDeleteFeature(feature);"
                                        >
                                            <v-ons-icon style="padding-right:5px;" icon="fa-ban"></v-ons-icon>
                                            <span>NO</span>
                                        </v-ons-button>
                                    </div>
                                </div>
                            </v-ons-carousel-item>
                        </v-ons-carousel>

                        <div
                            :id="'delete-flag-' + feature.id"
                            class="right" 
                            style="position:absolute; height:100%; right:0px; pointer-events:none; display:none;"
                        >
                            <v-ons-icon class="geomtery-button-icon" icon="fa-caret-left"></v-ons-icon>
                            <v-ons-icon class="geomtery-button-icon" icon="fa-caret-left"></v-ons-icon>
                            <v-ons-icon class="geomtery-button-icon" style="margin:5px;" icon="fa-trash"></v-ons-icon>
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
            zoomClicked: false,
            deleteClicked: false,
            selectedFeature: null,
            fullscreenActive: false,
            drawActive: false,
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

                    let deleteFlag, carousel;

                    if (this.selectedFeature) {
                        /* reset previous carousel */ 
                        carousel = document.querySelector(`#carousel-${this.selectedFeature.id}`);
                        carousel.setActiveIndex(0);

                        /* hide previous flag */ 
                        deleteFlag = document.querySelector(`#delete-flag-${this.selectedFeature.id}`);
                        deleteFlag.style.display = "none";
                    }

                    const listItem = document.querySelector(`#list-item-${e.features[0].id}`);
                    listItem.scrollIntoView({behavior: "smooth", block: "center"});
                    
                    this.selectFeature(e.features[0]);

                    /* reset current carousel */ 
                    carousel = document.querySelector(`#carousel-${e.features[0].id}`);
                    carousel.setActiveIndex(0);

                    /* show new flag */ 
                    deleteFlag = document.querySelector(`#delete-flag-${e.features[0].id}`);
                    deleteFlag.style.display = "flex";
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
        toggleDelete() {
            this.deleteActive = !this.deleteActive;
        },
        selectFeature(feature) {
           if ( 
               !this.selectedFeature
               || !feature /* allows null values but is confusing, let's remove this during refactor */
               || (this.selectedFeature && this.selectedFeature.id !== feature.id) 
            ) {
                this.selectedFeature = feature;
            }

            this.drawActive = false;
            this.zoomClicked = false;
            this.deleteClicked = false;
            
            /* force mapbox to highlight feature */ 
            this.draw.changeMode('simple_select', { 
                featureIds: this.selectedFeature ? [this.selectedFeature.id] : [],
            });
        },
        baz(feature) {
            let xCoord, yCoord, coordAverage, bounds;

            const getCoordAverage = coordList => {
                const accumulatedCoords = coordList.reduce((acc, coords) => {
                    acc[0] += coords[0];
                    acc[1] += coords[1];

                    return acc;
                }, [0, 0]);

                return [
                    accumulatedCoords[0] / coordList.length,
                    accumulatedCoords[1] / coordList.length,
                ]
            }

            switch (feature.geometry.type) {
                case 'Point':
                    xCoord = feature.geometry.coordinates[0];
                    yCoord = feature.geometry.coordinates[1];

                    break;
                case 'LineString':
                    coordAverage = getCoordAverage(feature.geometry.coordinates);
                    xCoord = coordAverage[0];
                    yCoord = coordAverage[1];

                    break;
                case 'Polygon':
                    const subGeometryAverages = feature.geometry.coordinates.map(coordList => getCoordAverage(coordList));

                    coordAverage = getCoordAverage(subGeometryAverages);
                    xCoord = coordAverage[0];
                    yCoord = coordAverage[1];

                    break;
            }

            return [xCoord, yCoord, bounds];
        },
        handleZoom(feature) {
            if (!this.selectedFeature) {
                this.handleListItemClick(feature);
                this.zoomClicked = true
            }
            else if (this.selectedFeature && this.selectedFeature.id !== feature.id) {
                this.handleListItemClick(feature);
                this.zoomClicked = true;
            }
            else {
                this.zoomClicked = !this.zoomClicked;
            }
            
            const [xCoord, yCoord, bounds] = this.baz(this.selectedFeature);

            this.map.flyTo({
                center: new window.mapboxgl.LngLat(xCoord, yCoord),
                zoom: 9,
            })

            if (this.zoomClicked) { /* giving a point a bbox overrides zoom */
                this.map.fitBounds(geojsonExtent(this.selectedFeature), { padding: { top: 20, right: 60, bottom: 20, left: 20 }, maxZoom: 9 });
            } 
            else { /* if zoom is already selected, let's fit the map to all features*/
                this.map.fitBounds(geojsonExtent(this.featureCollection), { padding: { top: 20, right: 60, bottom: 20, left: 20 } });
            }
        },
        handleListItemClick(feature) {
            let carousel, deleteFlag;

            if (!this.selectedFeature) {
                this.selectFeature(feature);
                
                deleteFlag = document.querySelector(`#delete-flag-${feature.id}`);
                deleteFlag.style.display = "flex";
            } 
            else if (this.selectedFeature.id !== feature.id) {
                carousel = document.querySelector(`#carousel-${this.selectedFeature.id}`);
                carousel.setActiveIndex(0);

                /* hide previous flag */ 
                deleteFlag = document.querySelector(`#delete-flag-${this.selectedFeature.id}`);
                deleteFlag.style.display = "none";
                
                this.selectFeature(feature);

                /* show new flag */ 
                deleteFlag = document.querySelector(`#delete-flag-${this.selectedFeature.id}`);
                deleteFlag.style.display = "flex";
            } 
            else { /* touch already selected list item */
                deleteFlag = document.querySelector(`#delete-flag-${this.selectedFeature.id}`);
                deleteFlag.style.display = "none";

                carousel = document.querySelector(`#carousel-${this.selectedFeature.id}`);
                
                if (carousel.getActiveIndex() === 0) {
                    this.selectFeature(null);
                } 

                this.map.fitBounds(geojsonExtent(this.featureCollection), { padding: { top: 20, right: 60, bottom: 20, left: 20 } });
            }
        },
        foobar(feature) {
            console.log('!!!', feature);

            // if (this.selectedFeature && this.selectedFeature.id === feature.id) {
                const carousel = document.querySelector(`#carousel-${feature.id}`);

                if (carousel && carousel.getActiveIndex() === 0) {
                    return true;
                }

                return false;
            // }

        },
        handleListItemDragStart(feature) {
            let carousel, deleteFlag;

            if (!this.selectedFeature) {
                this.selectFeature(feature);
                
                deleteFlag = document.querySelector(`#delete-flag-${feature.id}`);
                deleteFlag.style.display = "flex";
            } 
            else if (this.selectedFeature.id !== feature.id) {
                carousel = document.querySelector(`#carousel-${this.selectedFeature.id}`);
                carousel.setActiveIndex(0);

                /* hide previous flag */ 
                deleteFlag = document.querySelector(`#delete-flag-${this.selectedFeature.id}`);
                deleteFlag.style.display = "none";
                
                this.selectFeature(feature);

                /* show new flag */ 
                deleteFlag = document.querySelector(`#delete-flag-${this.selectedFeature.id}`);
                deleteFlag.style.display = "flex";
            }

            // GOOD BUT BUGGY
            // this.map.fitBounds(geojsonExtent(this.selectedFeature), { padding: { top: 20, right: 60, bottom: 20, left: 20 }, maxZoom: 9 });
        },
        handleFOO(feature) {
            setTimeout(() => {
                const carousel = document.querySelector(`#carousel-${feature.id}`);
                const deleteFlag = document.querySelector(`#delete-flag-${feature.id}`);
    
                if (carousel.getActiveIndex() !== 0) {
                    deleteFlag.style.display = "none";
                } 
                else {
                    deleteFlag.style.display = "flex";
                }
            }, 0);
        },
        handleDrawFeature(featureType) {
            if (this.selectedFeature) {
                const carousel = document.querySelector(`#carousel-${this.selectedFeature.id}`);
                carousel.setActiveIndex(0);

                const deleteFlag = document.querySelector(`#delete-flag-${this.selectedFeature.id}`);
                deleteFlag.style.display = "none";

                this.selectFeature(null);
            }

            if (featureType === 'point') {
                this.draw.changeMode('draw_point');
            }
            else if (featureType === 'line') {
                this.draw.changeMode('draw_line_string');
            }
            else if (featureType === 'polygon') {
                this.draw.changeMode('draw_polygon');
            }

            /* needs this delay to keep UI happy */ 
            setTimeout(() => {
                this.drawActive = true;
            }, 0);
        },
        handleFinishFeature() {
            this.drawActive = false;
            this.selectFeature(null);

            setTimeout(() => {
                const newlyCreatedFeature = this.foo[(this.foo.length - 1)];
                this.selectFeature(newlyCreatedFeature);

                const listItem = document.querySelector(`#list-item-${newlyCreatedFeature.id}`);
                listItem.scrollIntoView({behavior: "smooth", block: "center"});
            }, 0);
        },
        cancelDeleteFeature(feature) {
            const carousel = document.querySelector(`#carousel-${feature.id}`);
            carousel.setActiveIndex(0);
        },
        handleDeleteFeature() {
            // if (this.deleteClicked) { /* if delete is already active, let's delete the features */
                this.draw.trash();
                this.selectFeature(null);
                this.map.fitBounds(geojsonExtent(this.featureCollection), { padding: { top: 20, right: 60, bottom: 20, left: 20 } });
            // }
        },
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

.editor-widget {
    /* height: 100%; */
    height: inherit;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    width: 100%;
}



.white {
    background-color: red !important;
}

.blue {
    background-color: blue !important;
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
    border: 1px solid #bbb; 
    border-top: none;
}
.draw-button {
    padding: unset;
    border-radius: none;
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
    /* height: 100%; */
    /* width: 100%; */
    width: 89vw; /* forcing container viewwidth */
    /* padding-left: 65vw; */
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.geometry-button {
    /* height: 100%; */
    min-width: 35px;
    border-radius: 50%;
    padding: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #eee;
    border: 1px solid #bbb;
    color:  rgb(31, 31, 33, 0.8);
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
