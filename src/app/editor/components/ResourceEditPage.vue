<template>
    <div>
        <!-- Scrollable content here -->
        <ons-scroll infinit-scroll-enable="true" on-scrolled="pagination.nextPage()" can-load="true" threshold='100'>
       <v-ons-list>
           <v-ons-list-item v-if="resourceid === tile.resourceinstance_id" v-for="tile in tiles" :key="tile.tileid">
               <li><div class="label"><span>{{tile.tileid}}:</span></div></li>
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
    props: ['id'],
    data() {
        return {
            project: this.$store.getters.activeProject,
            resourceid: this.$store.getters.activeServer.active_resource
        };
    },
    computed: {
        tiles: {
            get: function() {
                return this.$store.getters.getTiles;
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
                resource['edited'] = {'day': date.toDateString(), 'time': date.toTimeString()};
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
