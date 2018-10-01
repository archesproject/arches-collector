<template>
    <div>
        <!-- Scrollable content here -->
        <ons-scroll infinit-scroll-enable="true" on-scrolled="pagination.nextPage()" can-load="true" threshold='100'>
            <v-ons-list>
                <v-ons-list-item tappable modifier="longdivider" v-for="resource_instance in resource_instances" :key="resource_instance.resourceinstanceid" @click="selectResourceInstance(resource_instance);">
                    <span>
                        <div class='resource-model-name'>
                            <span class="icon-circle" v-bind:style="{ background: [resource_types[resource_instance.graph_id.color]], color: '#fff'}">
                                <v-ons-icon class="resource-model-icon" v-bind:icon="resource_types[resource_instance.graph_id].iconclass.replace('fa ', '')" v-bind:style="{height:'18px', width:'18px'}"></v-ons-icon>
                            </span>
                            <span class='resource-model-title'>
                                <span style="padding-left: 0">{{resource_instance.displayname.replace(/['"]+/g,'')}}</span>
                                <span v-if="resource_instance.edited" class='resource-model-subtitle'>
                                    Last edit: {{resource_instance.edited.day}} @ {{resource_instance.edited.time}}</span>
                                <span v-else class='resource-model-subtitle'>Unedited</span>
                            </span>
                        </div>
                    </span>
                </v-ons-list-item>
            </v-ons-list>
        </ons-scroll>
    </div>
</template>
<script>
export default {
    name: 'SelectResourceInstancePage',
    props: ['project'],
    data() {
        return {
            state: 'initial',
            instances: [],
            resource_types: {},
            sorted: true,
            filter: ''
        };
    },
    computed: {
        resource_instances: function() {
            if (this.sorted) {
                return this.$underscore.sortBy(this.instances, function(resourceInstance) {
                    return resourceInstance.displayname;
                });
            } else {
                return this.$underscore.sortBy(this.instances, function(resourceInstance) {
                    return resourceInstance.displayname;
                }).reverse();
            }
        }
    },
    mounted() {
        this.getResourceData();
        var self = this;
        var resourceTypes = {};
        self.$store.getters.activeProject.graphs.forEach(function(graph) {
            resourceTypes[graph.graphid] = graph;
        });
        this.resource_types = resourceTypes;
    },
    methods: {
        selectResourceInstance: function(resource) {
            var payload = {
                resourceinstanceid: resource.resourceinstanceid
            };
            this.$store.commit('setActiveResourceInstance', payload);
            this.$router.push({
                'name': 'resource',
                params: {
                    id: resource
                }
            });
        },
        getResourceData: function() {
            return this.$store.dispatch(
                'getProjectResources',
                this.$store.getters.activeProject.id
            ).then((res) => {
                this.instances = res['docs'];
            });
        },
        sortResources: function(passeddata) {}

    }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.resource-model-name {
    display: flex;
    flex-direction: row;
}

.resource-model-title {
    display: flex;
    flex-direction: column;
    padding-left: 5px;
    color: #666;
    font-size: 15px;
}

.resource-model-subtitle {
    font-size: 12px;
    padding-top: 0px;
    color: #999;
}

.resource-model-icon {
    text-align: center;
}

.icon-circle {
    border: solid 1px #1B48DD;
    padding: 10px;
    border-radius: 50%;
    height: 18px;
    width: 18px;
    background: #d7e0f8;
}
</style>