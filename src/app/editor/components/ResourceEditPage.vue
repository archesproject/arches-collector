<template>
    <ons-scroll>
        <v-ons-list v-show="!showForm">
            <div v-show="canAdd(card) && (activeObject === 'card')">
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
            <div v-show="hasTiles(card) || activeObject === 'card'">
                <v-ons-list-item tappable modifier="longdivider" v-for="tile in cardTiles" :key="tile.tileid" @click="setTileContext(tile)">
                    <div><span>Tile Id: {{tile.tileid}}</span></div>
                    <ul>
                        <li class="widget" v-for="value, key in tile.data" :key="key" v-if="typeof value === 'string' || value instanceof String">
                            {{getTileData(tile, key)}}
                        </li>
                    </ul>
                </v-ons-list-item>
            </div>
            <div v-if="(activeObject === 'tile' && hasWidgets(card))">
                <v-ons-list-item tappable @click="setTileContext(tile, true)">
                    <span style="width: 90%">
                        <ul>
                            <li class="widget" v-for="value, key in tile.data" :key="key" v-if="typeof value === 'string' || value instanceof String">
                                {{getTileData(tile, key)}}
                            </li>
                        </ul>
                        <div>Edit record</div>
                    </span>
                    <span>
                        <div class="fa5 fa-pencil-alt text-color-dark add-card"></div>
                    </span>
                </v-ons-list-item>
            </div>
            <div v-if="(activeObject === 'tile')">
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
        </v-ons-list>
        <div v-show="showForm">
            <resource-edit-form :back="back" :tile="tile" :card="card" :save="saveTile" />
        </div>
    </ons-scroll>
</template>
<script>
export default {
    name: 'ResourceEditPage',
    props: ['goBack'],
    data() {
        return {
            project: this.$store.getters.activeProject,
            resourceid: this.$store.getters.activeServer.active_resource,
            allCards: this.$store.getters.activeGraph.cards,
            allNodegroups: this.$store.getters.activeGraph.nodegroups,
            allWidgets: this.$store.getters.activeGraph.widgets,
            user: this.$store.getters.activeServer.user
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
        cardinality: {
            get: function() {
                return this.getCardinality(this);
            }
        }
    },
    watch: {
        goBack: function() {
            this.back();
        }
    },
    methods: {
        back: function() {
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
        },
        getTileData: function(tile, key) {
            if (!!tile.provisionaledits && this.user.id in tile.provisionaledits){
                return tile.provisionaledits[this.user.id]['value'][key];
            }else{
                return tile.data[key];
            }
        },
        navigateChildCard: function(card, showForm) {
            var tile = this.$underscore.filter(this.allTiles, function(tile) {
                return tile.parenttile_id === (this.tile ? this.tile.tileid : null) && card.nodegroup_id === tile.nodegroup_id;
            }, this);

            if (this.getCardinality(card) === '1' && this.hasWidgets(card)) {
                if (this.hasWidgetsAndSubCards(card)) {
                    if (!!tile[0]) {
                        tile = this.tile;
                    } else {
                        showForm = true;
                        tile = this.getBlankTile(card, this.tile);
                    }
                } else {
                    showForm = true;
                    if (!!tile[0]) {
                        tile = tile[0];
                    } else {
                        tile = this.getBlankTile(card, this.tile);
                    }
                }
            } else {
                tile = this.tile;
            }
            console.log('navigateChildCard');
            console.log(tile);
            this.$store.getters.activeServer.card_nav_stack.unshift({
                'card': card,
                'tile': tile,
                'showForm': !!showForm,
                'activeObject': 'card'
            });
        },
        setTileContext: function(tile, showForm) {
            if (showForm === undefined) {
                if (this.hasChildCards() && !this.hasWidgets()) {
                    showForm = false;
                } else {
                    showForm = true;
                }
            }
            if (tile === 'blank') {
                tile = this.getBlankTile(this.card, this.tile);
                if (!this.hasWidgets(this.card)) {
                    this.saveTile(tile);
                }
            }
            this.$store.getters.activeServer.card_nav_stack.unshift({
                'card': this.card,
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
        hasWidgetsAndSubCards: function(card) {
            return this.hasWidgets(card) && this.hasChildCards(card);
        },
        canAdd: function(card) {
            if (!!card) {
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
        getBlankTile: function(card, parentTile) {
            return {
                data: {},
                nodegroup_id: card.nodegroup_id,
                parenttile_id: parentTile ? parentTile.tileid : null,
                provisionaledits: '',
                resourceinstance_id: this.resourceid,
                sortorder: '',
                tileid: '',
                type: 'tile',
                _id: ''
            };
        },
        saveTile: function(tile) {
            console.log('saving...');
            console.log(tile);
            // this.saving = true;
            this.$emit('saving', true);
            var self = this;

            this.$store.dispatch('persistTile', tile)
                .then(function(doc) {
                    return doc;
                })
                .finally(function() {
                    console.log('tile save finished...');
                    // self.saving = false;
                    // self.$store.commit('addTile', tile);
                    window.setTimeout(function() {
                        self.$emit('saving', false);
                    }, 2000);
                });
            // this.$store.dispatch(
            //     'getResource', {
            //         projectid: this.project.id,
            //         resourceid: this.$store.getters.activeServer.active_resource
            //     }
            // ).then((res) => {
            //     var resource = res['docs'][0];
            //     var date = new Date();
            //     resource['edited'] = {
            //         'day': date.toDateString(),
            //         'time': date.toTimeString()
            //     };
            //     this.$store.dispatch('persistResource', resource)
            //         .then(function(doc) {
            //             return doc;
            //         })
            //         .finally(function() {
            //             console.log('resource save finished...');
            //         });
            //});
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