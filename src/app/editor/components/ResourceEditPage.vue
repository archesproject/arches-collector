<template>
    <ons-scroll>
        <v-ons-list v-show="!showingForm">
            <div v-if="childCards.length > 0">
                <div v-if="hasTiles(card)">
                    <div v-if="cardinality === 'n'">
                        <v-ons-list-item tappable @click="navigateEditorTree(card)">
                            <div style="display:block; width: 100%">
                                <div>Add</div>
                               
                                <div>Create new record 
                                    <span style="float:right; position:relative; top: -8px; left: -18px">
                                        <div class="fa5 fa-plus-circle text-color-dark add-card"></div>
                                    </span>
                                </div>
                            </div>
                        </v-ons-list-item>
                    </div>
                    <v-ons-list-item tappable modifier="longdivider" v-for="tile in cardTiles" :key="tile.tileid" @click="navigateEditorTree(card, tile)">
                        <div><span>Tile Id: {{tile.tileid}}</span></div>
                        <ul>
                            <li class="widget" v-for="value, key in tile.data" :key="key" v-if="typeof value === 'string' || value instanceof String">
                                {{tile.data[key]}}
                            </li>
                        </ul>
                    </v-ons-list-item>
                </div>
                <div v-else>
                    <div v-if="nodegroup_id !== null">
                        <v-ons-list-item tappable @click="navigateEditorTree(card, 'blank')">
                            <div style="display:block; width: 100%">
                                <div>Add</div>
                               
                                <div>Create new record 
                                    <span style="float:right; position:relative; top: -8px; left: -18px">
                                        <div class="fa5 fa-plus-circle text-color-dark add-card"></div>
                                    </span>
                                </div>
                            </div>
                        </v-ons-list-item>
                    </div>
                    <v-ons-list-item tappable modifier="longdivider" v-for="card in childCards" :key="card.resourceinstanceid" @click="navigateEditorTree(card)">
                        <span style="width: 90%">
                           <div>{{card.name}}</div>
                           <div v-if="(tileCount(card) > 0)">{{tileCount(card)}} record(s)</div>
                           <div v-if="(tileCount(card) === 0)">No data entered</div>
                        </span>
                        <span v-if="hasChildCard(card)">
                            >
                        </span>
                        <span v-if="hasTiles(card)">
                            +
                        </span>
                        <span v-if="canAdd(card)">
                            <div class="fa5 fa-plus-circle text-color-dark add-card"></div>
                        </span>
                    </v-ons-list-item>
                </div>
            </div>
            <div v-else>
                <div v-if="hasTiles(card)">
                    <div v-if="cardinality === '1'">
                        <!-- we should be showing the form here -->
                    </div>
                    <div v-else>
                        <v-ons-list-item tappable @click="navigateEditorTree(card, 'blank')">
                            <div style="display:block; width: 100%">
                                <div>Add</div>
                               
                                <div>Create new record 
                                    <span style="float:right; position:relative; top: -8px; left: -18px">
                                        <div class="fa5 fa-plus-circle text-color-dark add-card"></div>
                                    </span>
                                </div>
                            </div>
                        </v-ons-list-item>
                        <v-ons-list-item tappable modifier="longdivider" v-for="tile in cardTiles" :key="tile.tileid" @click="navigateEditorTree(card, tile)">
                            <div><span>Tile Id: {{tile.tileid}}</span></div>
                            <ul>
                                <li class="widget" v-for="value, key in tile.data" :key="key" v-if="typeof value === 'string' || value instanceof String">
                                    {{tile.data[key]}}
                                </li>
                            </ul>
                        </v-ons-list-item>
                    </div>
                </div>
                <div v-else>
                    <div v-if="cardinality === '1'">
                        <!-- show blank form here -->
                    </div>
                    <div v-else>
                        <v-ons-list-item tappable @click="navigateEditorTree(card)">
                            <div style="display:block; width: 100%">
                                <div>Add</div>
                               
                                <div>Create new record 
                                    <span style="float:right; position:relative; top: -8px; left: -18px">
                                        <div class="fa5 fa-plus-circle text-color-dark add-card"></div>
                                    </span>
                                </div>
                            </div>
                        </v-ons-list-item>
                    </div>
                </div>
            </div>
        </v-ons-list>
        <div v-show="showingForm">
            <resource-edit-form :formContext="formContext" :tile="formContext.tile" :card="formContext.card" v-on:saving="(val) => $emit('saving', val)" />
        </div>
    </ons-scroll>
</template>
<script>
export default {
    name: 'ResourceEditPage',
    props: ['goBack'],
    data() {
        return {
            showingForm: false,
            nodegroup_id: null,
            pageStack: [],
            project: this.$store.getters.activeProject,
            resourceid: this.$store.getters.activeServer.active_resource,
            allCards: this.$store.getters.activeGraph.cards,
            allNodegroups: this.$store.getters.activeGraph.nodegroups,
            allWidgets: this.$store.getters.activeGraph.widgets,
            formContext: {
                tile: {
                    data: {},
                    nodegroup_id: '',
                    parenttile_id: '',
                    provisionaledits: '',
                    resourceinstance_id: '',
                    sortorder: '',
                    tileid: '',
                    type: ''
                },
                card: {}
            },
            tile: null
        };
    },
    computed: {
        card: {
            get: function() {
                return this.$underscore.find(this.allCards, function(card) {
                    return (card.nodegroup_id === this.nodegroup_id);
                }, this);
            }
        },
        childCards: {
            get: function() {
                return this.$underscore.filter(this.allCards, function(card) {
                    var nodegroups = this.$underscore.chain(this.allNodegroups)
                        .filter(function(group) {
                            return group.parentnodegroup_id === this.nodegroup_id;
                        }, this)
                        .pluck('nodegroupid')
                        .value();
                    return nodegroups.indexOf(card.nodegroup_id) !== -1;
                }, this);
            }
        },
        allTiles: {
            get: function() {
                if (!!this.resourceid) {
                    return this.$underscore.filter(this.$store.getters.tiles, function(tile) {
                        return tile.resourceinstance_id === this.resourceid;
                    }, this);
                } else {
                    return [];
                }
            }
        },
        cardTiles: {
            get: function() {
                return this.$underscore.filter(this.allTiles, function(tile) {
                    return tile.nodegroup_id === this.nodegroup_id; //&& tile.parenttile_id === this.tile ? this.tileid : null;
                }, this);
            }
        },
        cardWidgets: {
            get: function() {
                var widgets = this.$underscore.filter(this.allWidgets, function(widget) {
                    return widget.card_id === this.card.cardid;
                }, this);
                return widgets;
            }
        },
        cardinality: {
            get: function () {
                return this.getCardinality(this.nodegroup_id); 
            }
        }
    },
    watch: {
        goBack: function () {
            if(this.showingForm){
                this.showingForm = false;
            }else{
                if (this.$store.getters.activeServer.card_nav_stack.length === 1) {
                    this.$router.push({
                        'name': 'project',
                        params: {
                            'project': this.project,
                            'carouselIndex': 1
                        }
                    });
                } else {
                    this.$store.getters.activeServer.card_nav_stack.shift();
                    var navItem = this.$store.getters.activeServer.card_nav_stack[0];
                    if(!!navItem){
                        this.nodegroup_id = navItem.card.nodegroup_id;
                    } else {
                        this.nodegroup_id = null;
                    }
                }
            }
        }
    },
    methods: {
        navigateEditorTree: function(card, tile) {
            if (!!tile || ((this.getCardinality(card.nodegroup_id) === 'n' && !this.hasTiles(card) && !this.hasChildCard(card)) || (this.getCardinality(card.nodegroup_id) === '1' && !this.hasChildCard(card)))) {
                if (tile === 'blank'){
                    tile = {
                        data: {},
                        nodegroup_id: card.nodegroup_id,
                        parenttile_id: '',
                        provisionaledits: '',
                        resourceinstance_id: this.resourceid,
                        sortorder: '',
                        tileid: null,
                        type: 'tile'
                    }; // get a blank tile 
                }
                this.showingForm = true;
                console.log('card')
                console.log(card);
                console.log('tile')
                console.log(tile);
                //if (Object.keys(tile.data).length > 0){
                this.formContext = {
                    tile: tile,
                    card: card
                };
                // this.$store.getters.activeServer.card_nav_stack.unshift({
                //     'card': card,
                //     'tile': tile
                // });
            } else {
                console.log(card);
                this.showingForm = false;
                this.$store.getters.activeServer.card_nav_stack.unshift({
                    'card': card,
                    'tile': null
                });
                this.nodegroup_id = card.nodegroup_id;
            }
        },
        hasChildCard: function(card) {
            if (!card) {
                card = this.card;
            }
            var found = this.$underscore.find(this.allNodegroups, function(nodegroup) {
                return nodegroup.parentnodegroup_id === card.nodegroup_id;
            }, this);
            return !!found;
        },
        tileCount: function(card) {
            var nodegroupid = card ? card.nodegroup_id : this.nodegroup_id;
            var tiles = this.$underscore.filter(this.allTiles, function(tile) {
                return tile.nodegroup_id === nodegroupid;
            }, this);
            return tiles.length;
        },
        hasTiles: function(card) {
            return this.tileCount(card) > 0;
        },
        canAdd: function(card) {
            return this.getCardinality(card.nodegroup_id) === 'n' || this.hasTiles(card) === false;
        },
        getCardinality: function(nodegroupid) {
            var found = this.$underscore.find(this.allNodegroups, function(nodegroup) {
                return nodegroup.nodegroupid === nodegroupid;
            }, this);
            if (!!found) {
                return found.cardinality;
            }
            return '1'; 
        },
        save: function(tile) {
            console.log('saving...');
            this.$store.dispatch('persistTile', tile)
                .then(function(doc) {
                    return doc;
                })
                .finally(function() {
                    console.log('tile save finished...');
                });
            this.$store.dispatch(
                'getResource', {
                    projectid: this.project.id,
                    resourceid: this.$store.getters.activeServer.active_resource
                }
            ).then((res) => {
                var resource = res['docs'][0];
                var date = new Date();
                resource['edited'] = {
                    'day': date.toDateString(),
                    'time': date.toTimeString()
                };
                this.$store.dispatch('persistResource', resource)
                    .then(function(doc) {
                        return doc;
                    })
                    .finally(function() {
                        console.log('resource save finished...');
                    });
            });
        }
    }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
li.widget {
    list-style-type: none;
}
.label {
    padding: 5px;
    width: 325px;
}
ul {
    padding-left: 12px;
}
.add-card {
    font-size: 14px;
}
</style>
