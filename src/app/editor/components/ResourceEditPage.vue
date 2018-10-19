<template>
    <ons-scroll>
        <v-ons-list v-show="!showForm">
            <div v-if="canAdd(card)">
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
            </div>
            
            <div v-if="childCards.length > 0">
                <div v-if="hasTiles(card) && tile === null">
                    <v-ons-list-item tappable modifier="longdivider" v-for="tile in cardTiles" :key="tile.tileid" @click="setTileContext(tile)">
                        <div><span>Tile Id: {{tile.tileid}}</span></div>
                        <ul>
                            <li class="widget" v-for="value, key in tile.data" :key="key" v-if="typeof value === 'string' || value instanceof String">
                                {{tile.data[key]}}
                            </li>
                        </ul>
                    </v-ons-list-item>
                </div>
                <div v-else>
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
                    <v-ons-list-item tappable modifier="longdivider" v-for="childCard in childCards" :key="childCard.resourceinstanceid" @click="navigateChildCard(childCard)">
                        <span style="width: 90%">
                           <div>{{childCard.name}}</div>
                           <div v-if="(tileCount(childCard) > 0)">{{tileCount(childCard)}} record(s)</div>
                           <div v-if="(tileCount(childCard) === 0)">No data entered</div>
                        </span>
                        <span v-if="hasChildCard(childCard)">
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
            </div>
            <div v-else>
                <div v-if="hasTiles(card)">
                    <div v-if="cardinality === '1'">
                        <!-- we should be showing the form here -->
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
                        <v-ons-list-item tappable modifier="longdivider" v-for="tile in cardTiles" :key="tile.tileid" @click="setTileContext(tile)">
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
        <div v-show="tile !== null || showForm">
            <resource-edit-form :tile="tile" :card="card" v-on:saving="(val) => $emit('saving', val)" />
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
            },
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
                }
            }
        }
    },
    methods: {
        navigateChildCard: function(card, showForm) {
            // if (!!tile || 
            //     ((this.getCardinality(card.nodegroup_id) === 'n' && !this.hasTiles(card) && !this.hasChildCard(card)) || 
            //     (this.getCardinality(card.nodegroup_id) === '1' && !this.hasChildCard(card)))) {
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
            //         'showForm': !!showForm
            //     });

            // } else {
                var tile = this.$underscore.filter(this.allTiles, function(tile) {
                    return tile.parenttile_id === (this.tile ? this.tile.tileid : null) && card.nodegroup_id === tile.nodegroup_id;
                }, this);
                if(!this.hasChildCard(card) && tile.length === 1 && !this.canAdd(card)){
                    showForm = true;
                    tile = tile[0];
                } else {
                    tile = this.tile;
                }
                console.log('navigateChildCard');
                console.log(tile);
                this.showingForm = false;
                this.$store.getters.activeServer.card_nav_stack.unshift({
                    'card': card,
                    'tile': tile,
                    'showForm': !!showForm
                });
            //}
        },
        setTileContext: function(tile, showForm) {
            if (tile === 'blank'){
                showForm = true;
                tile = {
                    data: {},
                    nodegroup_id: this.card.nodegroup_id,
                    parenttile_id: this.tile ? this.tile.tileid : null,
                    provisionaledits: '',
                    resourceinstance_id: this.resourceid,
                    sortorder: '',
                    tileid: null,
                    type: 'tile'
                }; // get a blank tile 
            }else{
                if (Object.keys(tile.data).length > 0) {
                    showForm = true;
                }
            }
            this.$store.getters.activeServer.card_nav_stack.unshift({
                'card': this.card,
                'tile': tile,
                'showForm': !!showForm
            });
            return;

            if (!!tile || 
                ((this.getCardinality(card.nodegroup_id) === 'n' && !this.hasTiles(card) && !this.hasChildCard(card)) || 
                (this.getCardinality(card.nodegroup_id) === '1' && !this.hasChildCard(card)))) {
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
                // this.showingForm = true;
                // console.log('card')
                // console.log(card);
                // console.log('tile')
                // console.log(tile);
                // //if (Object.keys(tile.data).length > 0){
                // this.formContext = {
                //     tile: tile,
                //     card: card
                // };
                this.$store.getters.activeServer.card_nav_stack.unshift({
                    'card': card,
                    'tile': tile,
                    'showForm': !!showForm
                });
                // this.$store.getters.activeServer.card_nav_stack.unshift({
                //     'card': card,
                //     'tile': tile
                // });
            } else {
                console.log(card);
                this.showingForm = false;
                this.$store.getters.activeServer.card_nav_stack.unshift({
                    'card': card,
                    'tile': null,
                    'showForm': !!showForm
                });
                //this.card = card;
                //this.nodegroup_id = card.nodegroup_id;
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
            if(!!card){
                return this.getCardinality(card.nodegroup_id) === 'n' || this.hasTiles(card) === false;
            } 
            return false;
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
