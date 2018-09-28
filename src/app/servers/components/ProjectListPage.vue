<template>
    <page-header-layout>
        <v-ons-pull-hook
          :action="refreshProjectList"
          @changestate="state = $event.state"
        >
            <span v-show="state === 'initial'"> Pull to refresh </span>
            <span v-show="state === 'preaction'"> Release </span>
            <span v-show="state === 'action'"><v-ons-progress-circular indeterminate></v-ons-progress-circular></span>
        </v-ons-pull-hook>
        <v-ons-list>
            <v-ons-list-item class="projects-header" modifier="longdivider">
                <span class="left projects-title"><span>Projects</span></span>
                <span class="right">
                    <v-ons-icon icon="ion-ios-cloud-download"></v-ons-icon>
                </span>
            </v-ons-list-item>
            <v-ons-list-item tappable modifier="longdivider" v-for="project in projects" :key="project.id" @click="selectProject(project);" v-bind:class="{ inactive_project: !project.active }">
                <span>
                    <span class="project-name">{{project.name}}</span><br>
                    <span class="project-active" v-if="project.active">Active from:</span>
                    <span class="project-inactive" v-else>Inactive</span>
                    <span class="project-dates">{{project.startdate}} - {{project.enddate}}</span>
                </span>
            </v-ons-list-item>
        </v-ons-list>
    </page-header-layout>
</template>

<script>
export default {
    name: 'ProjectList',
    data() {
        return {
            state: 'initial'
        };
    },
    computed: {
        projects: {
            cache: false,
            get: function() {
                var self = this;
                // evidently computed properties only observe changes in the local data store
                // so we need to set 'cache: false'
                // see https://github.com/vuejs/vue/issues/1189#issuecomment-133211194
                var filterObj = function(objProp, value) {
                    return Object.keys(self.$store.getters.currentProjects)
                        .map(function(key) {
                            return self.$store.getters.currentProjects[key];
                        })
                        .filter(function(item) {
                            return item[objProp] === value;
                        });
                };
                var activeProjects = filterObj('active', true);
                var inActiveProjects = filterObj('active', false);
                return [...activeProjects, ...inActiveProjects];
            }
        }
    },
    methods: {
        selectProject(project) {
            var payload = {
                project_id: project.id
            };
            this.$store.commit('setActiveProject', payload);
            this.$router.push({'name': 'project', params: { project: project }});
        },
        refreshProjectList(done) {
            this.$store.dispatch('getRemoteProjects', this.$store.getters.activeServer)
                .finally(function() {
                    done();
                });
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

    .inactive_project{
        background-color: #f3f3f3;
    }

    .projects-header {
        color: #645F87;
        background: #f4f4f4;
        border-bottom: 1px solid #ddd;
    }

    .projects-title {
        font-size: 17px;
        font-weight: 500;
    }

    .project-name {
        color: #454545;
        font-size: 15px;
    }

    .project-active {
        color: #777;
        font-size: 13px;
    }

    .project-inactive {
        color: #777;
        font-size: 13px;
    }

    .project-dates {
        color: #555;
        font-size: 13px;
    }

</style>
