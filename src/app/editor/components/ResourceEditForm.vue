<template>
    <div>
        <!-- Scrollable content here -->
        <ons-scroll>
            <div>
                show form here ....
                <v-ons-list-item modifier="longdivider" v-for="widget in cardWidgets">
                    <span class="label"><span>{{widget.label}}({{datatype(widget)}}): </span></span>
                    
                    <component :allNodes="allNodes" :tile="tile" :widget="widget" v-bind:is="'base-widget'"></component>
                    <!-- <div v-show="widget === 'string'">
                        string....
                        <component :value="tileValue(widget)" v-bind:is="'string-widget'"></component>
                    </div> -->
                    
                </v-ons-list-item>
            </div>
        </ons-scroll>
   </div>
</template>
<script>
export default {
    name: 'ResourceEditForm',
    props: ['tile'],
    data() {
        return {
            allCards: this.$store.getters.activeGraph.cards,
            allWidgets: this.$store.getters.activeGraph.widgets,
            allNodes: this.$store.getters.activeGraph.nodes,
            lookup: {
                'string': 'string-widget',
                'concept': 'concept-widget'
            }
        };
    },
    computed: {
        widgetLookup: {
            get: function(){

            }
        },
        nodegroupid: {
            get: function() {
                return this.tile.nodegroup_id;
            }
        },
        card: {
            get: function() {
                return this.$underscore.find(this.allCards, function(card) {
                    return (card.nodegroup_id === this.nodegroupid);
                }, this);
            }
        },
        temp: {
            get: function(){
                console.log('tile changed');
                return this.tile;
            }
        },
        // cards: {
        //     get: function() {
        //         return this.$underscore.filter(this.allCards, function(card) {
        //             var nodegroups = this.$underscore.chain(this.allNodegroups)
        //                 .filter(function(group) {
        //                     return group.parentnodegroup_id === this.nodegroupid;
        //                 }, this)
        //                 .pluck('nodegroupid')
        //                 .value();
        //             return nodegroups.indexOf(card.nodegroup_id) !== -1;
        //         }, this);
        //     }
        // },
        // allTiles: {
        //     get: function() {
        //         if (!!this.resourceid) {
        //             return this.$underscore.filter(this.$store.getters.tiles, function(tile) {
        //                 return tile.resourceinstance_id === this.resourceid;
        //             }, this);
        //         } else {
        //             return [];
        //         }
        //     }
        // },
        // cardTiles: {
        //     get: function() {
        //         console.log('IM GETTING THE TILES');
        //         return this.$underscore.filter(this.allTiles, function(tile) {
        //             return tile.nodegroup_id === this.nodegroupid;
        //         }, this);
        //     }
        // },
        cardWidgets: {
            get: function() {
                if (!!this.card){
                    var widgets = this.$underscore.filter(this.allWidgets, function(widget) {
                        return widget.card_id === this.card.cardid;
                    }, this);
                    return this.$underscore.sortBy(widgets, 'sortorder');
                } else {
                    return [];
                }
            }
        },
        // cardinality: {
        //     get: function () {
        //         var found = this.$underscore.find(this.allNodegroups, function(nodegroup) {
        //             return nodegroup.nodegroupid === this.nodegroupid;
        //         }, this);
        //         if (!!found) {
        //             console.log(found.cardinality)
        //             return found.cardinality;
        //         }
        //         console.log('here')
        //         return 1; 
        //     }
        // }
    },
    methods: {

        // navigateToCard: function(card) {
        //     this.$emit('update_nodegroupid', card.nodegroup_id);
        // },
        // hasSubCard: function(card) {
        //     var found = this.$underscore.find(this.allNodegroups, function(nodegroup) {
        //         return nodegroup.parentnodegroup_id === card.nodegroup_id;
        //     }, this);
        //     return !!found;
        // },
        // tileCount: function(card) {
        //     var tiles = this.$underscore.filter(this.allTiles, function(tile) {
        //         return tile.nodegroup_id === card.nodegroup_id;
        //     }, this);
        //     return tiles.length;
        // },
        // hasTiles: function(card) {
        //     return this.tileCount(card) > 0;
        // },
        tileValue: function(widget) {
            if (!!this.tile) {
                console.log(this.tile.data[widget.node_id]);
                return this.tile.data[widget.node_id];
            }
        },
        datatype: function(widget) {
            var node = this.$underscore.find(this.allNodes, function(node) {
                return node.nodeid === widget.node_id;
            }, this);
            console.log('in datatype function')
            console.log(node.datatype)
            return node.datatype;
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

</style>
