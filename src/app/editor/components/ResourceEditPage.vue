<template>
   <v-ons-page>
       <v-ons-toolbar style="background-color: whitesmoke;">
           <div class="left">
               <v-ons-toolbar-button>
                   <router-link :to="{ name: 'project-page' }"><v-ons-icon class="text-color-dark project-header" icon="ion-android-arrow-dropleft-circle"></v-ons-icon></router-link>
               </v-ons-toolbar-button>
           </div>
           <div class="center"></div>
           <div class="right">
               <v-ons-toolbar-button>
                   <v-ons-icon class="text-color-dark project-name" icon="ion-ios-cloud-download-outline"></v-ons-icon>
               </v-ons-toolbar-button>
           </div>
       </v-ons-toolbar>

       <v-ons-list>
           <v-ons-list-item v-for="tile in tiles" :key="tile.tileid">
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
    computed: {
        tiles: {
            // cache: false,
            get: function() {
                // return [
                //     {'id': 'test'},
                //     {'id': 'blah'}
                // ]
                return this.$store.getters.getTiles;
                // return this.$store.dispatch('getTiles', this.$store.getters.activeProject.id)
                // .then(function(doc) {
                //     console.log(doc.rows);
                //     return doc.rows;
                // });
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
