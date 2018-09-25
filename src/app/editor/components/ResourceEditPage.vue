<template>
    <div>
        <!-- Scrollable content here -->
        <card-list :cards="cards" :tiles="tiles"></card-list>
        <ons-scroll infinit-scroll-enable="true" on-scrolled="pagination.nextPage()" can-load="true" threshold='100'>
        <v-ons-list>
           <v-ons-list-item v-if="resourceid === tile.resourceinstance_id" v-for="tile in tiles" :key="tile.tileid">
               <li><span>tileid: </span><span>{{tile.tileid}}</span></li>
               <table style="width: 100%;">
               <thead>
                   <tr>
                       <!-- <th>nodeid</th> -->
                       <th>value</th>
                   </tr>
               </thead>
               <tbody>
                   <tr v-for="value, key in tile.data" :key="key">
                       <td><textarea style="width: 100%; border: 1px solid gainsboro;" type="text" v-on:blur="save(tile)" v-model="tile.data[key]"></textarea></td>
                   </tr>
               </tbody>
               </table>
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
        console.log(this)
        return {
            project: this.$store.getters.activeProject,
            resourceid: this.$store.getters.activeServer.active_resource,
            cards: this.$store.getters.activeGraph.cards
        };
    },
    computed: {
        // cards: {
        //     get: function() {
        //         return this.$store.getters.getTiles;
        //     }
        // },
        tiles: {
            get: function() {
                console.log("IM GETTING THE TILES")
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


</style>
