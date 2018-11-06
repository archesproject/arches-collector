<template>
    <page-header-layout>

        <v-ons-splitter>
            <v-ons-splitter-side width="80%"
                collapse="" side="right"
                :open.sync="showSideNav" class="sidenav toolbar-header">
                <v-ons-page>
                    <v-ons-list style="margin-top: 5px;">
                        <v-ons-list-item tappable @click="sync">
                            <span class="text-color-dark label right-panel-label" v-if="selectedProject">{{selectedProject.name}}</span>
                        </v-ons-list-item @click="">
                        <v-ons-list-item tappable @click="sync" v-if="selectedProject && !selectedProject.deleted">
                            <v-ons-icon class="text-color-dark left menu-icon" icon="fa-cloud-download-alt"></v-ons-icon>
                            <div class="menu-text">
                                <span class="text-color-dark">Refresh all records in a project</span>
                                <span class="text-color-dark menu-subtext">Refresh all project data</span>
                            </div>
                        </v-ons-list-item @click="">
                        <v-ons-progress-bar indeterminate v-if="syncing"></v-ons-progress-bar>
                        <v-ons-list-item tappable v-if="selectedProject && !selectedProject.deleted">
                            <v-ons-icon class="text-color-dark left menu-icon" icon="fa-toggle-off"></v-ons-icon>
                            <div class="menu-text">
                                <span class="text-color-dark">Leave project</span>
                                <span class="text-color-dark menu-subtext">Stop synching with this active project</span>
                            </div>
                        </v-ons-list-item @click="">
                        <v-ons-list-item tappable>
                            <v-ons-icon class="text-color-dark left menu-icon" icon="fa-trash"></v-ons-icon>
                            <div class="menu-text">
                                <span class="text-color-dark">Delete this project from my device</span>
                                <span class="text-color-dark menu-subtext">Remove inactive project from my device</span>
                            </div>
                        </v-ons-list-item @click="">
                    </v-ons-list>
                </v-ons-page>
            </v-ons-splitter-side>

        <v-ons-splitter-content class="project-list-panel">
            <v-ons-pull-hook
              :action="refreshProjectList"
              @changestate="state = $event.state">
                <div v-show="state === 'initial'"> Pull to refresh </div>
                <div v-show="state === 'preaction'"> Release </div>
                <div v-show="state === 'action'"><v-ons-progress-circular indeterminate></v-ons-progress-circular></div>
            </v-ons-pull-hook>

        <v-ons-list>
            <v-ons-list-item class="projects-header" modifier="longdivider">
                <span class="left projects-title"><span>Projects</span></span>
                <span class="right">
                    <v-ons-icon icon="fa-ellipsis-v"></v-ons-icon>
                </span>
            </v-ons-list-item>
            <v-ons-progress-bar indeterminate v-if="syncing"></v-ons-progress-bar>
            <v-ons-list-item class="list-item" tappable modifier="longdivider" v-for="project in projects" :key="project.id" v-bind:class="{ inactive_project: !project.active, deleted: project.deleted }">
                <span style="line-height: 1.1em; border-style: 1px; background-color: light-blue; border-color: dark-blue;" @click="segueToProject(project);">
                    <span class="project-name">{{project.name}}</span><span class="project-name deleted" v-if="project.deleted">(Project deleted on cloud)</span><br>
                    <span class="project-active" v-if="project.active">Active from:</span>
                    <span class="project-inactive" v-else>Inactive</span>
                    <span class="project-dates">{{project.startdate}} - {{project.enddate}}</span>
                </span>
                <v-ons-icon class="right" style="display: flex" icon="fa-ellipsis-v" v-if="project.lastsync.date" @click="toggleSideNav(project)"></v-ons-icon>
                <v-ons-icon class="right" style="display: flex" icon="fa-cloud-download-alt" v-if="!project.lastsync.date" @click="function(){selectedProject = project; sync()}"></v-ons-icon>
            </v-ons-list-item>
        </v-ons-list>
        </v-ons-splitter-content>
        </v-ons-splitter>

    </page-header-layout>
</template>

<script>
export default {
    name: 'ProjectList',
    data() {
        return {
            state: 'initial',
            showSideNav: false,
            syncing: false,
            syncfailed: false,
            selectedProject: undefined
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
        segueToProject(project) {
            var payload = {
                project_id: project.id
            };
            this.$store.commit('setActiveProject', payload);
            this.$router.push({'name': 'project', params: { project: project, tabIndex: 0}});
        },
        toggleSideNav: function(project) {
            this.selectedProject = project;
            this.showSideNav = !this.showSideNav;
        },
        sync: function() {
            var self = this;
            this.syncing = true;
            this.syncfailed = false;
            this.$store.dispatch('syncRemote', this.selectedProject.id)
                .catch(function() {
                    self.syncfailed = true;
                })
                .finally(function(doc) {
                    console.log('syncing done');
                    self.syncing = false;
                });
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
        font-size: 14px;
    }

    .project-name.deleted {
        color: #454545;
        font-size: 14px;
        padding-left: 5px;
    }

    .project-active {
        color: #777;
        font-size: 12px;
        padding-left: 5px;
    }

    .project-inactive {
        color: #777;
        font-size: 13px;
    }

    .project-dates {
        color: #555;
        font-size: 12px;
    }

    .menu-icon {
        width: 25px;
        display: flex;
    }

    .menu-text {
        font-size: 15px;
        display: flex;
        flex-direction: column;
    }

    ons-list-item[disabled] {
      background-color: #ccc;
      pointer-events: none;
    }

    ons-list-item.deleted {
      background-color: #ccc;
    }

    .menu-subtext {
        font-size: 12px;
    }

    .list-item {
        border-bottom: 1px solid #eee;
    }

</style>
