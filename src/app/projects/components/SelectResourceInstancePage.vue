<template>
            <v-ons-page>
        <!-- Scrollable content here -->
            <v-ons-list>
                <v-ons-list-item class="resource-model-name-panel" tappable modifier="longdivider" v-for="resource_instance in resource_instances" :key="resource_instance.resourceinstanceid" @click="selectResourceInstance(resource_instance);">
                    <span>
                        <div class='resource-model-name'>
                            <span class="icon-circle" v-bind:style="{ background: [resource_types[resource_instance.graph_id.color]], color: '#fff'}">
                                <v-ons-icon class="resource-model-icon" v-bind:icon="resource_types[resource_instance.graph_id].iconclass.replace('fa ', '')" v-bind:style="{height:'14px', width:'14px'}"></v-ons-icon>
                            </span>
                            <span class='resource-model-title'>
                                <span style="padding-left: 0; padding-right: 10px;">{{resource_instance.displayname.replace(/['"]+/g,'')}}</span>
                                <span v-if="resource_instance.edited" class='resource-model-subtitle'>
                                    Last edit: {{resource_instance.edited.day}} @ {{resource_instance.edited.time}}</span>
                                <span v-else class='resource-model-subtitle'>Unedited</span>
                            </span>
                        </div>
                    </span>
                </v-ons-list-item>
            </v-ons-list>
                    </v-ons-page>
</template>
<script>
export default {
    name: 'SelectResourceInstancePage',
    props: ['project', 'lastsync'],
    data() {
        return {
            state: 'initial',
            instances: [],
            resource_types: {},
            sorted: false,
            sortValue: 'editDate',
            filter: ''
        };
    },
    watch: {
        lastsync: function(val) {
            this.getResourceData();
        }
    },
    computed: {
        resource_instances: function() {
            var self = this;
            if (this.sorted) {
                return this.$underscore.sortBy(this.instances, function(resourceInstance) {
                    if(self.sortValue === 'name'){
                        return resourceInstance.displayname;
                    }
                    if(self.sortValue === 'editDate'){
                        if(!!resourceInstance.edited){
                            return new Date(resourceInstance.edited.day + ' ' + resourceInstance.edited.time).valueOf();
                        }else{
                            return 0;
                        }
                    }
                });
            } else {
                return this.$underscore.sortBy(this.instances, function(resourceInstance) {
                    if(self.sortValue === 'name'){
                        return resourceInstance.displayname;
                    }
                    if(self.sortValue === 'editDate'){
                        if(!!resourceInstance.edited){
                            return new Date(resourceInstance.edited.day + ' ' + resourceInstance.edited.time).valueOf();
                        }else{
                            return 0;
                        }
                    }
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
            this.$store.commit('setActiveResourceInstance', resource);
            this.$store.commit('setActiveGraphId', resource.graph_id);
            this.$router.push({
                'name': 'resource',
                params: {
                    'nodegroupid': null,
                    'tabIndex': 0
                }
            });
        },
        getResourceData: function() {
            var self = this;
            return this.$store.dispatch(
                'getProjectResources',
                this.$store.getters.activeProject.id
            ).then((res) => {
                self.instances = [];
                res['docs'].forEach(function(doc){
                    if (self.resource_types[doc.graph_id]) {
                        self.instances.push(doc);
                    }
                });
            });
        },
        sortResources: function(passeddata) {}
    },
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.resource-model-name-panel {
    border-bottom: 1px solid #eee;
}

.resource-model-name {
    display: flex;
    flex-direction: row;
}

.resource-model-title {
    display: flex;
    flex-direction: column;
    padding-left: 5px;
    color: #666;
    font-size: 14px;
}

.resource-model-subtitle {
    font-size: 12px;
    padding-top: 0px;
    margin-top: -1px;
    color: #999;
}

.resource-model-icon {
    text-align: center;
    vertical-align: 5px;
    font-size: 14px;
}

.icon-circle {
    border: solid 1px #1B48DD;
    padding: 10px;
    border-radius: 50%;
    height: 14px;
    width: 14px;
    background: #d7e0f8;
}
</style>
