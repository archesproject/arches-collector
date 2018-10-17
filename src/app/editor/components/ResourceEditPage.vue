<template>
    <ons-scroll>
        <v-ons-list>
            <div v-if="childCards.length > 0">
                <div v-if="hasTiles(card)">
                    <div v-if="cardinality === 'n'">
                        <v-ons-list-item tappable @click="showForm(card)">
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
                    <v-ons-list-item tappable modifier="longdivider" v-for="tile in cardTiles" :key="tile.tileid" @click="showForm(card, tile)">
                        <div><span>Tile Id: {{tile.tileid}}</span></div>
                        <ul>
                            <li class="widget" v-for="value, key in tile.data" :key="key" v-if="typeof value === 'string' || value instanceof String">
                                {{tile.data[key]}}
                            </li>
                        </ul>
                    </v-ons-list-item>
                </div>
                <div v-else>
                    <div v-if="nodegroupid !== null">
                        <v-ons-list-item tappable @click="showForm(card)">
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
                    <v-ons-list-item tappable modifier="longdivider" v-for="card in childCards" :key="card.resourceinstanceid" @click="navigateToCard(card)">
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
                        <v-ons-list-item tappable @click="showForm(card)">
                            <div style="display:block; width: 100%">
                                <div>Add</div>
                               
                                <div>Create new record 
                                    <span style="float:right; position:relative; top: -8px; left: -18px">
                                        <div class="fa5 fa-plus-circle text-color-dark add-card"></div>
                                    </span>
                                </div>
                            </div>
                        </v-ons-list-item>
                        <v-ons-list-item tappable modifier="longdivider" v-for="tile in cardTiles" :key="tile.tileid" @click="showForm(card, tile)">
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
                        <v-ons-list-item tappable @click="showForm(card)">
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

        <!-- <v-ons-list>
            <v-ons-list-item tappable modifier="longdivider" v-for="card in childCards" :key="card.resourceinstanceid" @click="navigateToCard(card)">
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
        </v-ons-list>
        <div v-if="cardinality === 'n'">
            <v-ons-list>
                <v-ons-list-item tappable @click="showForm(card)">
                    <div style="display:block; width: 100%">
                        <div>Add</div>
                       
                        <div>Create new record 
                            <span style="float:right; position:relative; top: -8px; left: -18px">
                                <div class="fa5 fa-plus-circle text-color-dark add-card"></div>
                            </span>
                        </div>
                    </div>
                </v-ons-list-item>
                <v-ons-list-item tappable modifier="longdivider" v-for="tile in cardTiles" :key="tile.tileid" @click="showForm(card, tile)">
                    <div><span>Tile Id: {{tile.tileid}}</span></div>
                    <ul>
                        <li class="widget" v-for="value, key in tile.data" :key="key" v-if="typeof value === 'string' || value instanceof String">
                            {{tile.data[key]}}
                        </li>
                    </ul>
                </v-ons-list-item>
               
            </v-ons-list>
        </div> -->
        <!-- <div v-if="(cardinality === '1' && cardWidgets.length > 0)" style="text-align: center; padding: 100px;">
            show form here ....
            <v-ons-list-item tappable modifier="longdivider" v-for="widget in cardWidgets">
                <div class="label"><span>{{widget.label}}:</span></div>
            
            </v-ons-list-item>
        </div> -->
    </ons-scroll>
</template>
<script>
export default {
    name: 'ResourceEditPage',
    props: ['nodegroupid', 'tile'],
    data() {
        return {
            pageStack: [],
            project: this.$store.getters.activeProject,
            resourceid: this.$store.getters.activeServer.active_resource,
            allCards: this.$store.getters.activeGraph.cards,
            allNodegroups: this.$store.getters.activeGraph.nodegroups,
            allWidgets: this.$store.getters.activeGraph.widgets
        };
    },
    computed: {
        card: {
            get: function() {
                return this.$underscore.find(this.allCards, function(card) {
                    return (card.nodegroup_id === this.nodegroupid);
                }, this);
            }
        },
        childCards: {
            get: function() {
                return this.$underscore.filter(this.allCards, function(card) {
                    var nodegroups = this.$underscore.chain(this.allNodegroups)
                        .filter(function(group) {
                            return group.parentnodegroup_id === this.nodegroupid;
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
                    return tile.nodegroup_id === this.nodegroupid; //&& tile.parenttile_id === this.tile ? this.tileid : null;
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
                return this.getCardinality(this.nodegroupid); 
            }
        }
    },
    methods: {
        navigateToCard: function(card) {
            if ((this.getCardinality(card.nodegroup_id) === 'n' && !this.hasTiles(card) && !this.hasChildCard(card)) || (this.getCardinality(card.nodegroup_id) === '1' && !this.hasChildCard(card)) ) {
                this.showForm(card);
            }else{
                this.$emit('navigate-to-card', card);
            }
        },
        showForm: function(card, tile) {
            if (!tile) {
                tile =  {
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
            this.$emit('show-form', card, tile);
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
            var nodegroupid = card ? card.nodegroup_id : this.nodegroupid;
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
