<template>
   <v-ons-page>
       <v-ons-toolbar style="background-color: whitesmoke;">
           <div class="left">
               <v-ons-toolbar-button>
                   <router-link :to="{ name: 'select-resource-instance-page', params: { id: this.projectid } }"><v-ons-icon class="text-color-dark project-header" icon="ion-android-arrow-dropleft-circle"></v-ons-icon></router-link>
               </v-ons-toolbar-button>
           </div>
           <div class="center"></div>
       </v-ons-toolbar>

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
   </v-ons-page>
</template>

<script>
export default {
    name: 'ResourceEditPage',
    props: ['id'],
    data() {
        return {
            projectid: this.$store.getters.activeProject.id,
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
                    projectid: this.$store.getters.activeProject.id,
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
