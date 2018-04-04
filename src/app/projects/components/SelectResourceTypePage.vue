<template>
    <v-ons-page>
        <div class="body">
            <v-ons-list>
                <v-ons-list-item tappable modifier="longdivider" v-for="resource_type in resource_types" :key="resource_type.graphid" @click="selectResourceType(resource_type);">
                    <span>
                        <v-ons-icon v-bind:class="resource_type.iconclass"></v-ons-icon>New
                        {{resource_type.name}}{{resource_type.iconclass}}<br>
                        <span style="font-size: 12px;">Currently x records; x edited</span>
                    </span>
                </v-ons-list-item>
            </v-ons-list>
        </div>
    </v-ons-page>
</template>

<script>
export default {
    name: 'SelectResourceTypePage',
    data() {
        return {
            state: 'initial'
        };
    },
    computed: {
        resource_types: {
            cache: false,
            get: function() {
                var self = this;
                return self.$store.getters.activeProject.graphs;
            }
        }
    },
    methods: {
        selectResourceType: function(e) {
            console.log("You've selected:", e);
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


</style>
