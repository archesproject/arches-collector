<template>
    <div>
        <!-- Scrollable content here -->
        <ons-scroll>
              <v-ons-list>
                <v-ons-list-item tappable modifier="longdivider" v-for="card in cards" :key="card.resourceinstanceid" @click="navigate_subcard(card)">
                    <span style="width: 90%">
                       {{card.name}}
                    </span>
                    <span v-if="has_sub_card(card)">
                        >
                    </span>
                    <span v-if="has_tiles(card)">
                        +
                    </span>
                </v-ons-list-item>
                <v-ons-list-item v-for="tile in cardTiles" :key="tile.tileid">
                    <li>
                        <div class="label"><span>{{tile.tileid}}:</span></div>
                    </li>
                    <ul v-for="value, key in tile.data" :key="key" v-if="typeof value === 'string' || value instanceof String">
                        <li class="widget">
                            <component :value="tile.data[key]" v-bind:is="'string-widget'"></component>
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
    props: ['nodegroupid'],
    data() {
        return {
            pageStack: [],
            project: this.$store.getters.activeProject,
            resourceid: this.$store.getters.activeServer.active_resource,
            allcards: this.$store.getters.activeGraph.cards,
            allnodegroups: this.$store.getters.activeGraph.nodegroups
        };
    },
    computed: {
        cards: {
            get: function() {
                return this.$underscore.filter(this.allcards, function(card) {
                    var nodegroups = this.$underscore.chain(this.allnodegroups)
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
                    return tile.nodegroup_id === this.nodegroupid;
                }, this);
            }
        }
    },
    methods: {
        navigate_subcard: function(card) {
            this.$emit('update_nodegroupid', card.nodegroup_id);
        },
        has_sub_card: function(card) {
            var found = this.$underscore.find(this.allnodegroups, function(nodegroup) {
                return nodegroup.parentnodegroup_id === card.nodegroup_id;
            }, this);
            return !!found;
        },
        has_tiles: function(card) {
            var tiles = this.$underscore.filter(this.allTiles, function(tile) {
                return tile.nodegroup_id === card.nodegroup_id;
            }, this);
            return tiles.length > 0;
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
</style>
