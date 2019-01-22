<template>
    <page-header-layout>

        <v-ons-splitter>
            <v-ons-splitter-side width="80%"
                collapse="" side="right"
                :open.sync="showSideNav" class="sidenav toolbar-header">
                <v-ons-page>

                    <v-ons-list style="margin-top: 5px;" v-if="showAllProjectsMenuContent">
                        <v-ons-list-item>
                            <span class="text-color-dark label right-panel-label">All Projects</span>
                        </v-ons-list-item>
                        <v-ons-list-item tappable @click='toggleShowUnjoined'>
                            <v-ons-icon class="text-color-dark left menu-icon" icon="fa-toggle-on" v-if="showUnjoinedProjects === false"></v-ons-icon>
                            <v-ons-icon class="text-color-dark left menu-icon" icon="fa-toggle-off" v-else></v-ons-icon>
                            <div class="menu-text" v-if="showUnjoinedProjects === false">
                                <span class="text-color-dark">Show projects I've left</span>
                                <span class="text-color-dark menu-subtext">List all projects regardless of status</span>
                            </div>
                            <div class="menu-text" v-else>
                                <span class="text-color-dark">Show only projects I've joined</span>
                                <span class="text-color-dark menu-subtext">Show only projects I'm able to sync</span>
                            </div>
                        </v-ons-list-item @click="">
                        <v-ons-list-item tappable @click="$ons.notification.confirm({message: 'Deleting a project will remove all related data (synched and unsynched) from your device?. Are you sure you want to proceed?', callback: deleteAllInactiveProjects})">
                            <v-ons-icon class="text-color-dark left menu-icon" icon="fa-trash"></v-ons-icon>
                            <div class="menu-text">
                                <span class="text-color-dark">Delete all inactive projects</span>
                                <span class="text-color-dark menu-subtext">Remove all inactive projects from my device</span>
                            </div>
                        </v-ons-list-item @click="">
                    </v-ons-list>

                    <v-ons-list style="margin-top: 5px;" v-else>
                        <v-ons-list-item tappable @click="sync">
                            <span class="text-color-dark label right-panel-label" v-if="selectedProject">{{selectedProject.name}}</span>
                        </v-ons-list-item @click="">
                        <v-ons-list-item tappable @click="sync" v-if="selectedProject && !selectedProject.deleted && selectedProject.joined">
                            <v-ons-icon class="text-color-dark left menu-icon" icon="fa-cloud-download-alt"></v-ons-icon>
                            <div class="menu-text">
                                <span class="text-color-dark">Refresh all records in this project</span>
                                <span class="text-color-dark menu-subtext">Refresh all project data</span>
                                <span v-if="syncfailed" class="text-color-dark menu-subtext">Sync Failed... please try again.</span>
                            </div>
                        </v-ons-list-item @click="">
                        <v-ons-progress-bar indeterminate v-if="syncing"></v-ons-progress-bar>
                        <v-ons-list-item tappable v-if="selectedProject && !selectedProject.deleted && selectedProject.joined" @click="$ons.notification.confirm({message: 'Are you sure you want to leave this project?. If you leave, this project will not sync with the remote server unless you rejoin.', callback: toggleProjectParticipation})">
                            <v-ons-icon class="text-color-dark left menu-icon" icon="fa-toggle-off"></v-ons-icon>
                            <div class="menu-text">
                                <span class="text-color-dark">Leave project</span>
                                <span class="text-color-dark menu-subtext">Stop synching with this active project</span>
                            </div>
                        </v-ons-list-item @click="">
                        <v-ons-list-item tappable v-if="selectedProject && selectedProject.joined === false" @click="function(){toggleProjectParticipation(1)}">
                            <v-ons-icon class="text-color-dark left menu-icon" icon="fa-toggle-on"></v-ons-icon>
                            <div class="menu-text">
                                <span class="text-color-dark">Re-join project</span>
                                <span class="text-color-dark menu-subtext">Resume synching with this active project</span>
                            </div>
                        </v-ons-list-item @click="">
                        <v-ons-list-item tappable @click="$ons.notification.confirm({message: 'Are you sure you want to delete this Project? All unsynched data will be lost.', callback: deleteProject})">
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
            <v-ons-page>
                <v-ons-toolbar class="project-list-toolbar" style="background-color: whitesmoke;" modifier="longdivider">
                    <span class="left projects-title"><span>Projects</span></span>
                    <div class="center"></div>
                    <div class="right">
                        <v-ons-toolbar-button @click="toggleSideNav(projects)">
                            <v-ons-icon class="text-color-dark project-name" icon="fa-ellipsis-v"></v-ons-icon>
                        </v-ons-toolbar-button>
                    </div>
                </v-ons-toolbar>

                <v-ons-pull-hook
                  :action="refreshProjectList"
                  @changestate="state = $event.state">
                    <div v-show="state === 'initial'"> Pull to refresh </div>
                    <div v-show="state === 'preaction'"> Release </div>
                    <div v-show="state === 'action'"><v-ons-progress-circular indeterminate></v-ons-progress-circular></div>
                </v-ons-pull-hook>

            <v-ons-list>
                <v-ons-progress-bar indeterminate v-if="syncing"></v-ons-progress-bar>
                <v-ons-list-item tappable modifier="longdivider" v-for="project in projects" :key="project.id" v-bind:class="{ deleted: project.deleted, unjoined: project.joined === false }">
                    <span class="left" style="display: flex; flex-direction: column; align-items: baseline; line-height: 1.1em; border-style: 1px; background-color: light-blue; border-color: dark-blue;" @click="segueToProject(project);">
                        <span class="project-name">{{project.name}}</span><span class="project-name" v-if="project.joined === false"> - You've left this project</span>
                        <span v-if="!project.deleted">
                            <span class="project-name deleted"></span>
                            <span class="project-active">Active from:</span>
                            <span class="project-dates">{{project.startdate}} to {{project.enddate}}</span>
                        </span>
                        <span v-else>
                            <span class="project-name deleted"></span>
                            <span class="project-active">Inactive</span>
                        </span>
                    </span>
                    <span class="center" @click="segueToProject(project);"></span>
                    <v-ons-icon class="right" style="display: flex" icon="fa-ellipsis-v" v-if="project.joined !== undefined || project.deleted" @click="toggleSideNav(project)"></v-ons-icon>
                    <v-ons-icon class="right" style="display: flex" icon="fa-cloud-download-alt" v-if="project.joined === undefined && !project.deleted" @click="function(){selectedProject = project; sync()}"></v-ons-icon>
                </v-ons-list-item>
            </v-ons-list>
        </v-ons-page>
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
            selectedProject: undefined,
            showUnjoinedProjects: false,
            showAllProjectsMenuContent: false,
            server: this.$store.getters.activeServer
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
                        }, self)
                        .filter(function(item) {
                            return item[objProp] === value;
                        }, this);
                };
                var activeProjects = filterObj('active', true);
                var inActiveProjects = filterObj('active', false);
                var projectList = [...activeProjects, ...inActiveProjects].filter(function(p){
                    var projectStatus = self.getProjectStatus();
                    if (projectStatus) {
                        if (projectStatus[p.id] && (projectStatus[p.id].joined || self.showUnjoinedProjects) ) {
                            p.joined = projectStatus[p.id].joined
                            return p;
                        } else if (projectStatus[p.id] === undefined) {
                            return p;
                        }
                    } else {
                        return p;
                    }
                })
                return projectList;
            },
            set: function(arr) {
                return arr;
            }
        }
    },
    methods: {
        segueToProject(project) {
            if (project.joined) {
                var payload = {
                    project_id: project.id
                };
                this.$store.commit('setActiveProject', payload);
                this.$router.push({'name': 'project', params: {project: project, tabIndex: 0}});
            }
        },
        getProjectStatus: function() {
            var userProjectStatus;
            if (this.server && this.server.user_project_status) {
                userProjectStatus = this.$store.getters.activeServer.user_project_status[this.server.user.id]
            }
            return userProjectStatus;
        },
        toggleSideNav: function(project) {
            if (project && project.length) {
                this.selectedProject = undefined;
                this.showAllProjectsMenuContent = true;
            } else {
                this.showAllProjectsMenuContent = false;
                this.selectedProject = project;
            }
            this.showSideNav = !this.showSideNav;
        },
        toggleShowUnjoined: function(project) {
            this.showUnjoinedProjects = !this.showUnjoinedProjects;
        },
        sync: function() {
            var self = this;
            this.syncing = true;
            this.syncfailed = false;
            this.$store.dispatch('syncRemote', {'projectId': this.selectedProject.id})
                .catch(function() {
                    self.syncfailed = true;
                })
                .finally(function(doc) {
                    console.log('syncing done');
                    self.syncing = false;
                });
        },
        deleteProject: function(answer) {
            var self = this;
            if (answer === 1) {
                this.$store.dispatch('deleteProject', this.selectedProject.id)
                    .catch(function() {
                        console.log('delete failed');
                    })
                    .finally(function(doc) {
                        var index = self.$underscore.findIndex(self.projects, { id: self.selectedProject.id });
                        window.setTimeout(function() {
                            self.toggleSideNav(undefined)
                            self.projects = self.projects.splice(index, 1)
                        }, 250);
                    });
            } else {
                console.log('not deleting project');
            }
        },
        deleteAllInactiveProjects: function(answer){
            var self = this;
            if (answer === 1) {
                self.projects.forEach(function(p){
                    if (p.deleted) {
                        self.$store.dispatch('deleteProject', p.id)
                        .catch(function() {
                            console.log('delete failed');
                        });
                    }
                    window.setTimeout(function() {
                        self.toggleSideNav(undefined)
                    }, 250);
                });
            } else {
                console.log('user declined deletion')
            }
        },
        toggleProjectParticipation: function(answer) {
            var self = this;
            if (answer === 1) {
                this.$store.dispatch('toggleProjectParticipation', this.selectedProject.id)
                    .catch(function() {
                        console.log('failed to leave project');
                    })
                    .finally(function(doc) {
                        var index = self.$underscore.findIndex(self.projects, { id: self.selectedProject.id });
                        window.setTimeout(function() {
                            self.toggleSideNav(undefined)
                        }, 150);
                    }, this);
            } else {
                console.log('you are not leaving');
            }
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
        padding: 0 15px;
    }

    .project-name {
        color: #454545;
        font-size: 14px;
    }

    .project-active {
        color: #777;
        font-size: 12px;
        padding-left: 0px;
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

    ons-list-item.unjoined {
      background-color: #ddd;
    }

    .menu-subtext {
        font-size: 12px;
    }

    .list-item {
        border-bottom: 1px solid #eee;
    }

</style>
