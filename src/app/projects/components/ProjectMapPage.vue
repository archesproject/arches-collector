<template>
    <v-ons-page>
        <ons-progress-circular indeterminate v-if="loading">
        </ons-progress-circular>
        <div :id="mapId" v-on:touchstart="stopPropagation"></div>
        <div class="map-control-templates">
            <div ref="attribution">
                <a href="http://www.openmaptiles.org/" target="_blank">
                    &copy; OpenMapTiles
                </a>
                <a href="http://www.openstreetmap.org/about/" target="_blank">
                    &copy; OpenStreetMap contributors
                </a>
            </div>
            <div ref="popup">
                <div class="popup-content">
                    <h4>{{ selectedResource.displayname }}</h4>
                    <hr>
                    <div class="description">
                        {{ selectedResource.displaydescription }}
                    </div>
                </div>
            </div>
        </div>
    </v-ons-page>
</template>

<script>
import geojsonExtent from '@mapbox/geojson-extent';
import parseWKT from 'wellknown';
import uuidv4 from 'uuid/v4';
import 'mapbox-gl-cordova-offline/www/mapbox-gl.css';
// TODO: pull basemap layer styles from project?
import basemapLayers from '../../../assets/map/basemap_layers.json';

const mapboxgl = window.mapboxgl;

export default {
    name: 'ProjectMap',
    props: ['project'],
    data() {
        return {
            mapId: `project-map-${uuidv4()}`,
            bounds: new mapboxgl.LngLatBounds(
                geojsonExtent(
                    parseWKT(this.project.bounds)
                )
            ),
            resourceGeoJSON: {
                type: 'FeatureCollection',
                features: []
            },
            selectedResource: {
                id: null,
                displayname: '',
                displaydescription: ''
            },
            loading: true
        };
    },
    mounted() {
        this.setupBasemaps()
            .then(this.getResourceData)
            .then(this.mapInit)
            .then(() => {
                this.loading = false;
            });
    },
    methods: {
        setupBasemaps() {
            return this.$store.dispatch(
                'setupProjectBasemaps',
                this.project
            );
        },
        getResourceData() {
            return this.$store.dispatch(
                'getProjectResourcesGeoJSON',
                this.project.id
            ).then((resourceGeoJSON) => {
                this.resourceGeoJSON = resourceGeoJSON;
            });
        },
        mapInit() {
            return new mapboxgl.OfflineMap(this.getMapConfig())
                .then((map) => {
                    this.setMapExtent(map);
                    map.addControl(new mapboxgl.NavigationControl());
                    this.addResourceMarkers(map);
                    this.$emit('map-init', map);
                });
        },
        getMapConfig() {
            return {
                container: this.mapId,
                style: {
                    version: 8,
                    sources: {
                        openmaptiles: {
                            type: 'mbtiles',
                            path: `${this.project.id}.mbtiles`,
                            attribution: this.$refs.attribution.innerHTML
                        },
                        resources: {
                            type: 'geojson',
                            data: this.resourceGeoJSON
                        }
                    },
                    sprite: 'static/map/styles/klokantech-basic/sprite',
                    glyphs: 'static/map/fonts/{fontstack}/{range}.pbf',
                    layers: basemapLayers
                },
                hash: true
            };
        },
        setMapExtent(map) {
            const tr = map.transform;
            const nw = tr.project(this.bounds.getNorthWest());
            const se = tr.project(this.bounds.getSouthEast());
            const size = se.sub(nw);
            const scaleX = (tr.width - 80) / size.x;
            const scaleY = (tr.height - 80) / size.y;
            map.jumpTo({
                center: tr.unproject(nw.add(se).div(2)),
                zoom: tr.scaleZoom(tr.scale * Math.min(scaleX, scaleY))
            });
        },
        addResourceMarkers(map) {
            map.loadImage('static/map/marker.png', (err, img) => {
                if (err) throw err;
                const markerName = 'marker-pin';
                map.addImage(markerName, img);
                map.addLayer({
                    id: 'resource-markers',
                    type: 'symbol',
                    source: 'resources',
                    layout: {
                        'icon-image': markerName,
                        'icon-allow-overlap': true,
                        'icon-offset': [
                            0,
                            -86
                        ],
                        'icon-size': 0.15
                    }
                });
                map.on('click', 'resource-markers', (e) => {
                    const markerHeight = 28;
                    const markerRadius = 12;
                    const linearOffset = 5;
                    const offset = {
                        'top': [0, 0],
                        'top-left': [0, 0],
                        'top-right': [0, 0],
                        'bottom': [0, -markerHeight],
                        'bottom-left': [
                            linearOffset,
                            (markerHeight - markerRadius + linearOffset) * -1
                        ],
                        'bottom-right': [
                            -linearOffset,
                            (markerHeight - markerRadius + linearOffset) * -1
                        ],
                        'left': [
                            markerRadius,
                            (markerHeight - markerRadius) * -1
                        ],
                        'right': [
                            -markerRadius,
                            (markerHeight - markerRadius) * -1
                        ]
                    };
                    const feature = e.features[0];
                    const coords = feature.geometry.coordinates.slice();
                    this.selectedResource = feature.properties;

                    while (Math.abs(e.lngLat.lng - coords[0]) > 180) {
                        coords[0] += e.lngLat.lng > coords[0] ? 360 : -360;
                    }

                    new mapboxgl.Popup({offset: offset})
                        .setLngLat(coords)
                        .setDOMContent(this.$refs.popup)
                        .addTo(map);
                });
            });
        },
        stopPropagation(e) {
            e.stopPropagation();
        }
    }
};
</script>

<style scoped>
.mapboxgl-map {
    height: 100%;
    border: 1px solid rgb(200, 200, 200);
    box-sizing: border-box;
}
ons-progress-circular {
    display: block;
    margin: 50% auto;
}
.map-control-templates {
    display: none;
}
.popup-content {
    margin: 12px 6px 4px;
    color: dimgrey;
    max-width: 170px;
}
.popup-content .description {
    font-size: 0.8em;
    line-height: 1.2em;
    margin: 2px;
}
</style>
