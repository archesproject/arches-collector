<template>
    <div>
        <!-- Scrollable content here -->
        <ons-scroll>
            <div>
                show form here ....
                <v-ons-list-item modifier="longdivider" v-for="widget in cardWidgets">
                    <span class="label"><span>{{widget.label}}({{datatype(widget)}}): </span></span>
                    
                    <component :allNodes="allNodes" :formContext="formContext" :tile="tile" :widget="widget" v-bind:is="'base-widget'"></component>
                    
                </v-ons-list-item>
            </div>
        </ons-scroll>
   </div>
</template>
<script>
export default {
    name: 'ResourceEditForm',
    props: ['formContext', 'tile', 'card'],
    data() {
        return {
            allCards: this.$store.getters.activeGraph.cards,
            allWidgets: this.$store.getters.activeGraph.widgets,
            allNodes: this.$store.getters.activeGraph.nodes
        };
    },
    computed: {
        nodegroupid: {
            get: function() {
                return this.card.nodegroup_id;
            }
        },
        // card: {
        //     get: function() {
        //         return this.formContext.card;
        //     }
        // },
        // tile: {
        //     get: function() {
        //         return this.formContext.tile;
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
        }
    },
    methods: {
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
