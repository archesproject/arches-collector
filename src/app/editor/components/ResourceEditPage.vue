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
                <div tappable modifier="longdivider" v-for="tile in editableCardTiles" :key="tile.tileid" @click="setTileContext(tile)" class="tile-instance">
                    <div class="flex relative">
                        <span class="fa5 fa-ellipsis-v drag-bars"></span>
                        <component v-if="displayWidget(card)" class="widget" :allNodes="allNodes" :tile="tile" :tiles="tiles" :widget="displayWidget(card)" :context="'nav'" v-bind:is="'base-widget'"></component>
                        <span v-else class="flex tile-data">
                            <div>{{card.name}}</div>
                            <div class="widget-label">card</div>
                        </span>
                        <span v-if="canDeleteTile(tile)" class="tile-delete">
                            <span class="tile-delete-icon fa5 fa-trash" @click="deleteTiles(tile, $event)"></span>
                        </span>
                    </div>
                </div>
            </div>
            <div v-if="(activeObject === 'tile' && hasWidgets(card))">
                <v-ons-list-item tappable @click="setTileContext(tile, true)">
                    <span style="width: 90%">
                        <div class="widget" v-for="(value, key) in tile.data" :key="key" v-if="(typeof value === 'string' || value instanceof String)">
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
                <v-ons-list-item class="root-card" tappable modifier="longdivider" v-for="childCard in editableChildCards" :key="childCard.resourceinstanceid" @click="navigateChildCard(childCard)">
                    <span style="display: flex; width: 100%">
                        <span style="width: 93%">
                            <div class="card-name">{{childCard.name}}</div>
                            <div class="card-instance-count" v-if="(tileCount(childCard) > 0)">{{tileCount(childCard)}} record(s)</div>
                            <div class="card-instance-count" v-if="(tileCount(childCard) === 0)">No data entered</div>
                        </span>
                        <span style="padding-top: 12px;" v-if="canAdd(childCard)">
                            <div class="fa5 fa-plus-circle text-color-dark add-card"></div>
                        </span>
                        <span style="padding-left: 10px;" v-if="canDeleteTiles(getCardTiles(childCard))">
                            <div class="tile-delete-icon fa5 fa-trash" @click="deleteTiles(getCardTiles(childCard), $event)"></div>
                        </span>
                    </span>
                </v-ons-list-item>
            </div>
        </v-ons-list>
        
        <div class="done-btn btn-delete" v-show="(!showForm && activeObject === 'tile' && !!tile && canDeleteTile(tile))">
            <v-ons-button @click="deleteTiles(tile, $event, back)" class="warning">
                <v-ons-icon class="done-btn-icon resource-header" icon="fa-trash"></v-ons-icon> Delete this Record
            </v-ons-button>
        </div>

        <resource-edit-form v-show="showForm" :back="back" :tile="tile" :tiles="tiles" :card="card" />
    </v-ons-page>
</template>
<script>
import navlogicmixin from '../mixins/nav-logic';

export default {
    name: 'ResourceEditPage',
    props: ['goBack', 'tiles', 'activeindex'],
    mixins: [navlogicmixin],
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
        editableChildCards: {
            get: function() {
                return this.$underscore.filter(this.childCards, function(childCard) {
                    return this.canEdit(childCard);
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
        editableCardTiles: {
            get: function() {
                return this.$underscore.filter(this.cardTiles, function(cardTile) {
                    return this.canEdit(cardTile);
                }, this);
            }
        },
        cardinality: {
            get: function() {
                return this.getCardinality(this);
            }
        },
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
            if (this.activeindex === 0) {
                this.$router.push({
                    name: 'project',
                    params: {
                        project: this.project,
                        tabIndex: 1
                    }
                });
            } else if (this.$store.getters.activeServer.card_nav_stack.length === 1) {
                if (this.$store.getters.activeServer.card_nav_stack[0].editorTab !== undefined) {
                    this.$emit('switch-tabs', this.$store.getters.activeServer.card_nav_stack[0].editorTab);
                    this.$store.getters.activeServer.card_nav_stack = [];
                    this.$store.getters.activeServer.card_nav_stack.unshift({ card: null, tile: null, showForm: false, activeObject: 'tile' });
                } else {
                    this.$router.push({
                        name: 'project',
                        params: {
                            project: this.project,
                            tabIndex: this.$store.getters.activeServer.card_nav_stack[0].tabIndex
                        }
                    });
                }
            } else {
                var navItem = this.$store.getters.activeServer.card_nav_stack[0];
                var previousNavItem = this.$store.getters.activeServer.card_nav_stack[1];
                if (this.hasWidgetsAndSubCards(navItem.card) && navItem.card !== previousNavItem.card && navItem.showForm === true && this.tile.tileid !== '') {
                    var parentOfThisTile = this.$underscore.find(this.tiles, function(tile) {
                        return tile.tileid === this.tile.parenttile_id;
                    }, this);
                    this.$store.getters.activeServer.card_nav_stack.splice(1, 0, {
                        card: navItem.card,
                        tile: !!parentOfThisTile ? parentOfThisTile : null,
                        showForm: false,
                        activeObject: 'card'
                    });
                    this.$store.getters.activeServer.card_nav_stack.splice(1, 0, {
                        card: navItem.card,
                        tile: navItem.tile,
                        showForm: false,
                        activeObject: 'tile'
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
                if (!!tile.provisionaledits && this.user.id in tile.provisionaledits) {
                    value = tile.provisionaledits[this.user.id].value[key];
                } else {
                    value = tile.data[key];
                }
                return { label: widget.label, value: !!value ? value : 'undefined' };
            } else {
                return { label: '', value: card.name };
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
                card: card,
                tile: tile,
                showForm: !!showForm,
                activeObject: 'card'
            });
        },
        getCardTiles: function(card) {
            var nodegroupid = card ? card.nodegroup_id : this.nodegroup_id;
            var tiles = this.$underscore.filter(this.tiles, function(tile) {
                return tile.nodegroup_id === nodegroupid;
            }, this);
            return tiles;
        },
        tileCount: function(card) {
            return !!card ? this.getCardTiles(card).length : 0;
        },
        hasTiles: function(card) {
            return this.tileCount(card) > 0;
        },
        canAdd: function(card) {
            if (!!card) {
                return this.getCardinality(card) === 'n' || this.hasTiles(card) === false;
            }
            return false;
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
    font-size: 22px;
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
    padding: 20px 10px 20px 10px;
    background-color: #e8e6e6;
    display: inline-block;
    margin-right: 5px;
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
    padding-left: 5px;
    flex-grow: 1;
}
.widget-label {
    color: #999;
    font-size: 13px;
    padding-bottom: 0px;
}
.relative {
    position: relative;
}
.tile-delete {
    position: absolute;
    right: 10px;
    top: 18px;
    opacity: .7;
}

.btn-delete {
    padding: 20px;
    float: right;
}

.tile-delete-icon {
    padding: 10px 11px;
    background: #eee;
    border: 1px solid #bbb;
    border-radius: 50%;
}
</style>
