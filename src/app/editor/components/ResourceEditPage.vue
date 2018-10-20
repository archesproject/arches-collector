<template>
    <ons-scroll>
        <v-ons-list v-show="!showForm">
            <div v-show="canAdd(card) && (activeObject === 'card')">
                <v-ons-list-item tappable @click="setTileContext('blank')" addCard='lkj'>
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
            
      
            <div v-show="hasTiles(card) || activeObject === 'card'">
                <v-ons-list-item tappable modifier="longdivider" v-for="tile in cardTiles" :key="tile.tileid" @click="setTileContext(tile)">
                    <div><span>Tile Id: {{tile.tileid}}</span></div>
                    <ul>
                        <li class="widget" v-for="value, key in tile.data" :key="key" v-if="typeof value === 'string' || value instanceof String">
                            {{tile.data[key]}}
                        </li>
                    </ul>
                </v-ons-list-item>
            </div>
            <div v-if="(activeObject === 'tile')">
                <!-- <div v-if="nodegroup_id !== null">
                    <v-ons-list-item tappable @click="setTileContext('blank')">
                        <div style="display:block; width: 100%">
                            <div>Add</div>
                           
                            <div>Create new record 
                                <span style="float:right; position:relative; top: -8px; left: -18px">
                                    <div class="fa5 fa-plus-circle text-color-dark add-card"></div>
                                </span>
                            </div>
                        </div>
                    </v-ons-list-item>
                </div> -->
                <div> here </div>
                <v-ons-list-item tappable modifier="longdivider" v-for="childCard in childCards" :key="childCard.resourceinstanceid" @click="navigateChildCard(childCard)">
                    <span style="width: 90%">
                       <div>{{childCard.name}}</div>
                       <div v-if="(tileCount(childCard) > 0)">{{tileCount(childCard)}} record(s)</div>
                       <div v-if="(tileCount(childCard) === 0)">No data entered</div>
                    </span>
                    <span v-if="hasChildCards(childCard)">
                        >
                    </span>
                    <span v-if="hasTiles(childCard)">
                        +
                    </span>
                    <span v-if="canAdd(childCard)">
                        <div class="fa5 fa-plus-circle text-color-dark add-card"></div>
                    </span>
                </v-ons-list-item>
            </div>
            
            <div>
                <div v-if="hasTiles(card)">
                    <div v-if="cardinality === '1'">
                        <!-- we should be showing the form here
                    </div>
                    <div v-else>
                        <!-- <v-ons-list-item tappable @click="setTileContext('blank')">
                            <div style="display:block; width: 100%">
                                <div>Add</div>
                               
                                <div>Create new record 
                                    <span style="float:right; position:relative; top: -8px; left: -18px">
                                        <div class="fa5 fa-plus-circle text-color-dark add-card"></div>
                                    </span>
                                </div>
                            </div>
                        </v-ons-list-item> -->
                       <!--  <v-ons-list-item tappable modifier="longdivider" v-for="tile in cardTiles" :key="tile.tileid" @click="setTileContext(tile)">
                            <div><span>Tile Id: {{tile.tileid}}</span></div>
                            <ul>
                                <li class="widget" v-for="value, key in tile.data" :key="key" v-if="typeof value === 'string' || value instanceof String">
                                    {{tile.data[key]}}
                                </li>
                            </ul>
                        </v-ons-list-item> -->
                    </div>
                </div>
                <div v-else>
                    <div v-if="cardinality === '1'">
                        <!-- show blank form here -->
                    </div>
                    <!-- <div v-else>
                        <v-ons-list-item tappable @click="setTileContext('blank')">
                            <div style="display:block; width: 100%">
                                <div>Add</div>
                               
                                <div>Create new record 
                                    <span style="float:right; position:relative; top: -8px; left: -18px">
                                        <div class="fa5 fa-plus-circle text-color-dark add-card"></div>
                                    </span>
                                </div>
                            </div>
                        </v-ons-list-item>
                    </div> -->
                </div>
            </div>
        </v-ons-list>
        <div v-show="showForm">
            <resource-edit-form :tile="tile" :card="card" v-on:saving="(val) => $emit('saving', val)" />
        </div>
    </ons-scroll>
</template>
<script>
import uuidv4 from 'uuid/v4';
export default {
    name: 'ResourceEditPage',
    props: ['goBack'],
    data() {
        return {
            showingForm: false,
            //nodegroup_id: null,
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
                card: {
                    nodegroup_id: null
                }
            }
            // card: null,
            // tile: null
        };
    },
    computed: {
        currentNavItem: {
            get: function() {
                if (!!this.$store.getters.activeServer) {
                    return this.$store.getters.activeServer.card_nav_stack[0];
                }
            }
        },
        nodegroup_id: {
            get: function() {
                return !!this.card ? this.card.nodegroup_id : null;
            }
        },
        card: {
            get: function() {
                var navItem = this.currentNavItem;
                if (!!navItem) {
                    return navItem.card;
                }
                return null;
            }
        },
        tile: {
            get: function() {
                var navItem = this.currentNavItem;
                if (!!navItem) {
                    return navItem.tile;
                }
                return null;
            }
        },
        activeObject: {
            get: function() {
                var navItem = this.currentNavItem;
                if (!!navItem) {
                    return navItem.activeObject;
                }
                return null;
            }
        },
        showForm: {
            get: function() {
                var navItem = this.currentNavItem;
                if (!!navItem) {
                    return navItem.showForm;
                }
                return false;
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
                    return tile.parenttile_id === (this.tile ? this.tile.tileid : null) && tile.nodegroup_id === this.nodegroup_id;
                }, this);
            }
        },
        // cardWidgets: {
        //     get: function() {
        //         var widgets = this.$underscore.filter(this.allWidgets, function(widget) {
        //             return widget.card_id === this.card.cardid;
        //         }, this);
        //         return widgets;
        //     }
        // },
        cardinality: {
            get: function () {
                return this.getCardinality(this); 
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
                }
            }
        }
    },
    methods: {
        navigateChildCard: function(card, showForm) {
            // if (!!tile || 
            //     ((this.getCardinality(card.nodegroup_id) === 'n' && !this.hasTiles(card) && !this.hasChildCards(card)) || 
            //     (this.getCardinality(card.nodegroup_id) === '1' && !this.hasChildCards(card)))) {
            //     if (tile === 'blank'){
            //         tile = {
            //             data: {},
            //             nodegroup_id: card.nodegroup_id,
            //             parenttile_id: '',
            //             provisionaledits: '',
            //             resourceinstance_id: this.resourceid,
            //             sortorder: '',
            //             tileid: null,
            //             type: 'tile'
            //         }; // get a blank tile 
            //     }

            //     this.$store.getters.activeServer.card_nav_stack.unshift({
            //         'card': card,
            //         'tile': tile,
            //         'showForm': !!showForm,
            //         'activeObject': 'card'
            //     });

            // } else {
                var tile = this.$underscore.filter(this.allTiles, function(tile) {
                    return tile.parenttile_id === (this.tile ? this.tile.tileid : null) && card.nodegroup_id === tile.nodegroup_id;
                }, this);

                //if(!this.hasChildCards(card) && tile.length === 1 && !this.canAdd(card)){
                if(this.getCardinality(card) === '1' && this.hasWidgets(card) && !this.hasChildCards(card)){
                    showForm = true;
                    if (!!tile[0]) {
                        tile = tile[0];
                    } else {
                        tile = this.getBlankTile(card, this.tile);
                    }
                } else {
                    tile = this.tile;
                }
                console.log('navigateChildCard');
                console.log(tile);
                this.showingForm = false;
                this.$store.getters.activeServer.card_nav_stack.unshift({
                    'card': card,
                    'tile': tile,
                    'showForm': !!showForm,
                    'activeObject': 'card'
                });
            //}
        },
        setTileContext: function(tile, showForm) {
            if(showForm === undefined){
                if (this.hasChildCards() && !this.hasWidgets()){
                    showForm = false;
                }else{
                    showForm = true;
                }
            }
            if (tile === 'blank'){
                tile = this.getBlankTile(this.card, this.tile);
                // tile = {
                //     data: {},
                //     nodegroup_id: this.card.nodegroup_id,
                //     parenttile_id: this.tile ? this.tile.tileid : null,
                //     provisionaledits: '',
                //     resourceinstance_id: this.resourceid,
                //     sortorder: '',
                //     tileid: uuidv4(),
                //     type: 'tile'
                // }; // get a blank tile 
            }
            // else{
            //     if (Object.keys(tile.data).length > 0) {
            //         showForm = true;
            //     }
            // }
            var card = this.card;
            // if (this.hasWidgets(this.card) && this.childCards.length === 0){
            //     console.log('TACI')
            //     card = this.childCards[0];
            // }
            this.$store.getters.activeServer.card_nav_stack.unshift({
                'card': card,
                'tile': tile,
                'showForm': !!showForm,
                'activeObject': 'tile'
            });
        },
        hasChildCards: function(card) {
            if (!card) {
                card = this.card;
            }
            var found = this.$underscore.find(this.allNodegroups, function(nodegroup) {
                return nodegroup.parentnodegroup_id === (!!card ? card.nodegroup_id : null);
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
        hasWidgets: function(card) {
            if (!!card) {
                var widgets = this.$underscore.filter(this.allWidgets, function(widget) {
                    return widget.card_id === card.cardid;
                }, this);
                return widgets.length > 0;
            } 
            return false;
        },
        canAdd: function(card) {
            if(!!card){
                return this.getCardinality(card) === 'n' || this.hasTiles(card) === false;
            } 
            return false;
        },
        getCardinality: function(card) {
            var found = this.$underscore.find(this.allNodegroups, function(nodegroup) {
                return nodegroup.nodegroupid === card.nodegroup_id;
            }, this);
            if (!!found) {
                return found.cardinality;
            }
            return '1'; 
        },
        getBlankTile: function(card, parentTile){
            var tileid = uuidv4();
            return {
                data: {},
                nodegroup_id: card.nodegroup_id,
                parenttile_id: parentTile ? parentTile.tileid : null,
                provisionaledits: '',
                resourceinstance_id: this.resourceid,
                sortorder: '',
                tileid: tileid,
                type: 'tile',
                _id: tileid
            };
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
