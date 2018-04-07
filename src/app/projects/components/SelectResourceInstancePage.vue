<template>
    <v-ons-page>
    <div class="content">
  <!-- Scrollable content here -->
     <ons-scroll infinit-scroll-enable="true" on-scrolled="pagination.nextPage()" can-load="true" threshold='100'>
            <v-ons-list>
                <v-ons-list-item tappable modifier="longdivider" v-for="resource_instance in instances" :key="resource_instance.resourceinstanceid" @click="selectResourceInstance(resource_instance);">
                    <span>
                        <div class='resource-model-name'>
                            <span class="icon-circle" v-bind:style="{ border: ['solid', '1px', '#6611FF'], background: [resource_types[resource_instance.graph_id.color]], color: '#fff'}">
                                <v-ons-icon v-bind:icon="resource_types[resource_instance.graph_id].iconclass.replace('fa ', '')" v-bind:style="{height:'18px', width:'18px'}"></v-ons-icon>
                            </span>
                        <span class='resource-model-title'>
                            <span style="padding-left: 0"> New {{resource_instance.displayname}}</span>
                            <span class='resource-model-subtitle'>Currently x records; x edited</span>
                        </span>
                        </div>
                    </span>
                </v-ons-list-item>
            </v-ons-list>
        </ons-scroll>
    </div>
</v-ons-page>
</template>

<script>
export default {
    name: 'SelectResourceInstancePage',
    props: ['project'],
    data() {
        return {
            state: 'initial',
            instances: [],
            resource_types: {}
        };
    },
    computed: {
    },
    mounted() {
        this.getResourceData();
        console.log('getting resource types');
        var self = this;
        var resourceTypes = {};
        self.$store.getters.activeProject.graphs.forEach(function(graph) {
            resourceTypes[graph.graphid] = graph;
        });
        console.log(resourceTypes);
        this.resource_types = resourceTypes;
    },
    methods: {
        selectResourceInstance: function(e) {
            console.log("You've selected:", e);
        },
        getResourceData: function() {
            return this.$store.dispatch(
                'getProjectResources',
                this.$store.getters.activeProject.id
            ).then((res) => {
                console.log('results', res);
                this.instances = res['docs'];
            });
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .resource-model-name {
        padding-top: 10px;
        display: flex;
        flex-direction: row;
    }
    .resource-model-title {
        display: flex;
        flex-direction: column;
        padding-left: 5px;
    }
    .resource-model-subtitle {
        font-size: 12px;
        padding-top: 2px;
    }
    .icon-circle {
        border: solid 1px #aec3f4;
        padding: 10px;
        border-radius: 50%;
        height: 18px;
        width: 18px;
        background: #d7e0f8;
    }
</style>
