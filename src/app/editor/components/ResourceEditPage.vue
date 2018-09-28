<template>
    <div>
        <!-- Scrollable content here -->
        <card-list :allcards="cards" :tiles="tiles" :cards="topCards"></card-list>
        <ons-scroll infinit-scroll-enable="true" on-scrolled="pagination.nextPage()" can-load="true" threshold='100'>
       <v-ons-list>
           <v-ons-list-item v-for="tile in tiles" :key="tile.tileid">
               <li><div class="label"><span>{{tile.tileid}}:</span></div></li>
                   <ul v-for="value, key in tile.data" :key="key" v-if="typeof value === 'string' || value instanceof String">
                   <li class="widget">
                       <string-widget :value="tile.data[key]"></string-widget>
                   </li>
                </ul>
           </v-ons-list-item>
       </v-ons-list>
   </ons-scroll>
   </div>
</template>
<script>
export default {
    name: 'ResourceEditPage',
    props: [],
    data() {
        return {
            project: this.$store.getters.activeProject,
            resourceid: this.$store.getters.activeServer.active_resource,
            cards: this.$store.getters.activeGraph.cards,
            nodegroups: this.$store.getters.activeGraph.nodegroups
        };
    },
    computed: {
        // cards: {
        //     get: function() {
        //         return this.$store.getters.activeGraph.cards;
        //     }
        // },
        topCards: {
            get: function() {
                return this.$underscore.filter(this.cards, function(card) {
                    var nodegroups = this.$underscore.chain(this.nodegroups)
                        .filter(function(group) {
                            return group.parentnodegroup_id === null;
                        }, this)
                        .pluck('nodegroupid')
                        .value();
                    return nodegroups.indexOf(card.nodegroup_id) !== -1;
                }, this);
            }
        },
        tiles: {
            get: function() {
                console.log('IM GETTING THE TILES');
                return this.$underscore.filter(this.$store.getters.getTiles, function(tile) {
                    return tile.resourceinstance_id === this.resourceid;
                }, this);
            }
        }
    },
    methods: {
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
</style>
