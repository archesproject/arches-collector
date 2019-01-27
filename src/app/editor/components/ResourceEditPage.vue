<template>
    <v-ons-page>
        <v-ons-list v-show="!showForm">
            <div v-show="canAdd(card) && (activeObject === 'card')">
                <v-ons-list-item tappable @click="setTileContext('blank')">
                    <div style="display:block; width: 100%">
                        <div class="card-name">Add</div>
                        <div class="widget-label">Create new record
                            <span style="float:right; position:relative; top: -8px; left: -12px">
                                <div class="fa5 fa-plus-circle text-color-dark add-card"></div>
                            </span>
                        </div>
                    </div>
                </v-ons-list-item>
            </div>
            <div v-show="hasTiles(card) || activeObject === 'card'">
                <div tappable modifier="longdivider" v-for="tile in cardTiles" :key="tile.tileid" @click="setTileContext(tile)" class="tile-instance">
                    <div class="flex">
                        <span class="fa5 fa-ellipsis-v drag-bars"></span>
                        <!-- <span class="flex tile-data"><div>{{getTileData(tile, card).value}}</div><div class="widget-label">{{getTileData(tile, card).label}}</div></span> -->
                        <component v-if="card" class="widget" :allNodes="allNodes" :tile="tile" :tiles="tiles" :widget="displayWidget(card)" :context="'nav'" v-bind:is="'base-widget'"></component>
                        <span v-if="canDelete(tile)" class="tile-delete">
                            <span class="fa5 fa-trash" @click="deleteTile(tile, $event)"></span>
                        </span>
                    </div>
                </div>
            </div>
            <div v-if="(activeObject === 'tile' && hasWidgets(card))">
                <v-ons-list-item tappable @click="setTileContext(tile, true)">
                    <span style="width: 90%">
                        <div class="widget" v-for="value, key in tile.data" :key="key" v-if="typeof value === 'string' || value instanceof String">
                            {{getTileData(tile, card).value}}
                        </div>
                        <div>Edit record</div>
                    </span>
                    <span>
                        <div class="fa5 fa-pencil-alt text-color-dark add-card"></div>
                    </span>
                </v-ons-list-item>
            </div>
            <div v-if="(activeObject === 'tile')">
                <v-ons-list-item class="root-card" tappable modifier="longdivider" v-for="childCard in childCards" :key="childCard.resourceinstanceid" v-if="canEdit(childCard)" @click="navigateChildCard(childCard)">
                    <span style="display: flex; width: 100%">
                        <span style="width: 93%">
                            <div class="card-name">{{childCard.name}}</div>
                            <div class="card-instance-count" v-if="(tileCount(childCard) > 0)">{{tileCount(childCard)}} record(s)</div>
                            <div class="card-instance-count" v-if="(tileCount(childCard) === 0)">No data entered</div>
                        </span>
                        <span style="padding-top: 7px;" v-if="hasTiles(childCard) && getCardinality(childCard) === '1' && !hasChildCards(childCard)">
                            <div class="fa5 fa-trash" @click="deleteTile(getCardTiles(childCard)[0], $event)"></div>
                        </span>
                        <span style="padding-top: 7px;" v-if="canAdd(childCard)">
                            <div class="fa5 fa-plus-circle text-color-dark add-card"></div>
                        </span>
                    </span>
                </v-ons-list-item>
            </div>
        </v-ons-list>
        <div v-show="showForm">
            <resource-edit-form :back="back" :tile="tile" :tiles="tiles" :card="card" :save="saveTile" />
        </div>
    </v-ons-page>
</template>
<script>
export default {
    name: 'ResourceEditPage',
    props: ['goBack', 'resourceid', 'tiles', 'activeindex'],
    data() {
        return {
            project: this.$store.getters.activeProject,
            allCards: this.$store.getters.activeGraph.cards,
            allNodes: this.$store.getters.activeGraph.nodes,
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
        cardTiles: {
            get: function() {
                return this.$underscore.filter(this.tiles, function(tile) {
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
            // if the current card in the card stack hasWidgetsAndSubCards and
            // the previous card in the card stack is not equal to the current card in the card stack
            // and the form is being displayed and the form was saved (has a tileid),
            // then
            // pop the current item off the card stack and save for later,
            // make a copy of the saved nav item, but set the activeObject to "tile", set showForm to false,
            // and set the tile to null or the parent tile of this.tile
            // push that onto the stack
            // push the saved item back onto the stack, but change the showForm to false
            if (this.activeindex===0) {
                this.$router.push({
                    'name': 'project',
                    params: {
                        'project': this.project,
                        'tabIndex': 1
                    }
                });
            } else if (this.$store.getters.activeServer.card_nav_stack.length === 1) {
                this.$router.push({
                    'name': 'project',
                    params: {
                        'project': this.project,
                        'tabIndex': this.$store.getters.activeServer.card_nav_stack[0].tabIndex
                    }
                });
            } else {
                var navItem = this.$store.getters.activeServer.card_nav_stack[0];
                var previousNavItem = this.$store.getters.activeServer.card_nav_stack[1];
                if (this.hasWidgetsAndSubCards(navItem.card) && navItem.card !== previousNavItem.card && navItem.showForm === true && this.tile.tileid !== '') {
                    var parentOfThisTile = this.$underscore.find(this.tiles, function(tile) {
                        return tile.tileid === this.tile.parenttile_id;
                    }, this);
                    this.$store.getters.activeServer.card_nav_stack.splice(1, 0, {
                        'card': navItem.card,
                        'tile': !!parentOfThisTile ? parentOfThisTile : null,
                        'showForm': false,
                        'activeObject': 'card'
                    });
                    this.$store.getters.activeServer.card_nav_stack.splice(1, 0, {
                        'card': navItem.card,
                        'tile': navItem.tile,
                        'showForm': false,
                        'activeObject': 'tile'
                    });
                }
                this.$store.getters.activeServer.card_nav_stack.shift();
            }
        },
        displayWidget: function(card) {
            var widgets = this.$underscore.filter(this.allWidgets, function(widget) {
                return widget.card_id === card.cardid;
            }, this);
            if (widgets.length > 0) {
                var value;
                return this.$underscore.sortBy(widgets, 'sortorder')[0];
            }
            return undefined;
        },
        getTileData: function(tile, card) {
            var widgets = this.$underscore.filter(this.allWidgets, function(widget) {
                return widget.card_id === card.cardid;
            }, this);
            if (widgets.length > 0) {
                var value;
                var widget = this.$underscore.sortBy(widgets, 'sortorder')[0];
                var key = widget.node_id;
                var node = this.$underscore.find(this.allNodes, function(node) {
                    return node.nodeid === key;
                });
                if (!!tile.provisionaledits && this.user.id in tile.provisionaledits) {
                    value = tile.provisionaledits[this.user.id]['value'][key];
                } else {
                    value = tile.data[key];
                }
                return {label: widget.label, value: !!value ? value : 'undefined'};
            } else {
                return {label: '', value: card.name};
            }
        },
        navigateChildCard: function(card, showForm) {
            var tile = this.$underscore.filter(this.tiles, function(tile) {
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
        getCardTiles: function(card){
            var nodegroupid = card ? card.nodegroup_id : this.nodegroup_id;
            var tiles = this.$underscore.filter(this.tiles, function(tile) {
                return tile.nodegroup_id === nodegroupid;
            }, this);
            return tiles;
        },
        tileCount: function(card) {
            return this.getCardTiles(card).length;
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
        canEdit: function(card) {
            return (!!card ? this.user.editable_nodegroups.includes(card.nodegroup_id) : false);
        },
        canAdd: function(card) {
            if (!!card) {
                return this.getCardinality(card) === 'n' || this.hasTiles(card) === false;
            }
            return false;
        },
        canDelete: function(tile) {
            if (!!tile) {
                return this.user.deletable_nodegroups.includes(tile.nodegroup_id) && (this.user.is_reviewer || (Object.keys(tile.data).length === 0 && Object.keys(tile.provisionaledits).length === 1 && Object.keys(tile.provisionaledits)[0] === String(this.user.id)));
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
                provisionaledits: {},
                resourceinstance_id: this.resourceid,
                sortorder: 0,
                tileid: '',
                type: 'tile',
                _id: ''
            };
        },
        saveTile: function(tile) {
            console.log('saving...');
            console.log(tile);
            this.$emit('saving', true);
            var self = this;

            this.$store.dispatch('persistTile', tile)
                .then(function(savedTile) {
                    return savedTile;
                })
                .finally(function() {
                    console.log('tile save finished...');
                    window.setTimeout(function() {
                        self.$emit('saving', false);
                    }, 2000);
                });
        },
        deleteTile: function(tile, e) {
            console.log('in deleteTile');
            console.log('tile: ', tile)
            e.stopPropagation();
            this.$store.dispatch('deleteTile', tile)
                .finally(function() {
                    console.log('tile delete finished...');
                });
        }
    }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.root-card {
    border-bottom: 1px solid #eee;
}

.card-name {
    color: #271F4C;
}

.card-instance-count {
    color: #999;
    font-size: 13px;
}

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
.tile-instance {
    padding: 0px !important;
    border-bottom: solid 1px #ccc;
    background-color: whitesmoke
}
.tile-instance .list-item--longdivider__center {
    padding: 0px !important;
}
.tile-instance:first-child {
    border-top: solid 1px #ccc;
}
.tile-instance:last-child {
    border-bottom: solid 1px #ccc;
}
.drag-bars {
    padding: 20px 15px 20px 10px;
    background-color: #e8e6e6;
    display: inline-block;
    margin-right: 0px;
}
.flex {
    display: flex;
}
.flex .flex {
    border-bottom: transparent;
}
.tile-data {
    flex-direction: column;
    padding-top: 11px;
    flex-grow: 1;
}
.widget-label {
    color: #999;
    font-size: 13px;
    padding-bottom: 0px;
}
.tile-delete {
    padding: 20px;
    border-left: 1px solid #ddd;
}
</style>
