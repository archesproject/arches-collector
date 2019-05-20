<template>
<v-ons-page>
    <!-- Scrollable content here -->
    <v-ons-list>
        <v-ons-list-item class="resource-model-name-panel" v-bind:class="{ edited: resource_instance.edited }" tappable modifier="longdivider" v-for="resource_instance in resource_instances" :key="resource_instance.resourceinstanceid" @click="selectResourceInstance(resource_instance);">
            <span class="icon-circle" v-bind:class="{ edited: resource_instance.edited }" v-bind:style="{ background: [resource_types[resource_instance.graph_id].color], color: '#fff' }">
                <v-ons-icon class="resource-model-icon" v-bind:icon="resource_types[resource_instance.graph_id].iconclass.replace('fa ', '')" v-bind:style="{}"></v-ons-icon>
            </span>
            <span class='resource-model-title'>
                <span style="padding-left: 0; padding-right: 10px;">{{resource_instance.displayname.replace(/['"]+/g,'')}}</span>
                <span v-if="resource_instance.edited" class='resource-model-subtitle'>
                    Edit: {{resource_instance.datetime}}</span>
                <span v-else class='resource-model-subtitle'>Unedited</span>
            </span>
            <span v-if="resource_instance.resourceinstanceid in $store.getters.activeProject.newly_created_resources" @click="deleteResource(resource_instance, $event)" class="resource-delete">
                <span class="resource-delete-icon fa5 fa-trash"></span>
            </span>

        </v-ons-list-item>
    </v-ons-list>
</v-ons-page>
</template>

<script>
import moment from 'moment';
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
                    'tabIndex': 1
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
                        if (doc.edited) {
                            var datetime = moment(doc.edited.day + ' ' + doc.edited.time);
                            if (datetime.isValid()) {
                                doc.datetime = datetime.format('D MMMM YYYY @ h:mm:ss a');
                            }
                        }
                        self.instances.push(doc);
                    }
                });
            });
        },
        deleteResource: function(resource, e) {
            var self = this;
            e.stopPropagation();
            this.$ons.notification.confirm({
                message: 'Are you sure you want to delete this Resource?<br><br>All data related to this resource will be lost.',
                callback: function(answer) {
                    if (answer === 1) {
                        self.$store.dispatch('deleteResource', resource);
                        self.getResourceData();
                    } else {
                        //console.log('not deleting');
                    }
                }
            })
        },
        sortResources: function(passeddata) {}
    },
};
</script>

<style scoped>
.resource-model-name-panel {
    background: #f7f7f7;
    border-bottom: 1px solid #ddd;
    margin-top: 1px;
}
.resource-model-name-panel.edited {
    background: #fff;
}
.resource-model-name {
    display: flex;
}
.resource-model-title {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    padding-left: 5px;
    color: #271F4C;
    font-size: 14px;
    width: 250px;
    margin-top: 2px;
}
.resource-model-subtitle {
    font-size: 12px;
    padding-top: 0px;
    margin-top: -1px;
    color: #999;
    letter-spacing: -0.01em;
}
.resource-model-icon {
    text-align: center;
    vertical-align: 5px;
    font-size: 14px;
    margin: 10px auto;
    width: 100%;
}
.icon-circle {
    box-sizing: border-box;
    border: solid 1px #1B48DD;
    border-radius: 50%;
    height: 36px;
    width: 36px;
    background: #d7e0f8;
    opacity: .7;
}

.icon-circle.edited {
    opacity: 1;
}

.resource-delete {
    padding: 7px 10px;
    font-size: 12px;
    color: #454545;
    height: 32px;
    width: 32px;
    box-sizing: border-box;
    border-left: 1px solid #bbb;
    background: #ddd;
    position: absolute;
    border-radius: 50%;
    right: 16px;
    top: 16px;
    bottom: 0px;
    opacity: .75;
}

.resource-delete-icon {

}

</style>
