<template>
    <div>
        <!-- Scrollable content here -->
        <ons-scroll>
            <v-ons-list>
                <v-ons-list-item tappable modifier="longdivider" v-for="card in cards" :key="card.resourceinstanceid" @click="navigateToCard(card)">
                    <span style="width: 90%">
                       <div>{{card.name}}</div>
                       <div v-if="(tileCount(card) > 0)">{{tileCount(card)}} record(s)</div>
                       <div v-if="(tileCount(card) === 0)">No data entered</div>
                    </span>
                    <!-- <span v-if="hasSubCard(card)">
                        >
                    </span> -->
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
                    <v-ons-list-item tappable>
                        <div style="display:block; width: 100%">
                            <div>Add</div>
                           
                            <div>Create new record 
                                <span style="float:right; position:relative; top: -8px; left: -18px">
                                    <div class="fa5 fa-plus-circle text-color-dark add-card"></div>
                                </span>
                            </div>
                        </div>
                    </v-ons-list-item>
                    <v-ons-list-item tappable modifier="longdivider" v-for="tile in cardTiles" :key="tile.tileid">
                        <div class="label"><span>{{tile.tileid}}:</span></div>
                        <ul v-for="value, key in tile.data" :key="key" v-if="typeof value === 'string' || value instanceof String">
                            <li class="widget">
                                <component :value="tile.data[key]" v-bind:is="'string-widget'"></component>
                            </li>
                        </ul>
                    </v-ons-list-item>
                   
                </v-ons-list>
            </div>
            <div v-if="(cardinality === '1' && cardWidgets.length > 0) || showForm" style="text-align: center; padding: 100px;">
                show form here ....
                <v-ons-list-item tappable modifier="longdivider" v-for="widget in cardWidgets">
                    <div class="label"><span>{{widget.label}}:</span></div>
                
                </v-ons-list-item>
            </div>
        </ons-scroll>
   </div>
</template>
<script>
export default {
    name: 'ResourceEditPage',
    props: ['nodegroupid'],
    data() {
        return {
            pageStack: [],
            project: this.$store.getters.activeProject,
            resourceid: this.$store.getters.activeServer.active_resource,
            allCards: this.$store.getters.activeGraph.cards,
            allNodegroups: this.$store.getters.activeGraph.nodegroups,
            allWidgets: this.$store.getters.activeGraph.widgets,
            showForm: false
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
        cards: {
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
                console.log('IM GETTING THE TILES');
                return this.$underscore.filter(this.allTiles, function(tile) {
                    return tile.nodegroup_id === this.nodegroupid;
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
                var found = this.$underscore.find(this.allNodegroups, function(nodegroup) {
                    return nodegroup.nodegroupid === this.nodegroupid;
                }, this);
                if (!!found) {
                    console.log(found.cardinality)
                    return found.cardinality;
                }
                console.log('here')
                return 1; 
            }
        }
    },
    methods: {
        navigateToCard: function(card) {
            this.$emit('update_nodegroupid', card.nodegroup_id);
        },
        hasSubCard: function(card) {
            var found = this.$underscore.find(this.allNodegroups, function(nodegroup) {
                return nodegroup.parentnodegroup_id === card.nodegroup_id;
            }, this);
            return !!found;
        },
        tileCount: function(card) {
            var tiles = this.$underscore.filter(this.allTiles, function(tile) {
                return tile.nodegroup_id === card.nodegroup_id;
            }, this);
            return tiles.length;
        },
        hasTiles: function(card) {
            return this.tileCount(card) > 0;
        },
        canAdd: function(card) {
            return card.cardinality === 'n' || this.hasTiles(card) === false;
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
