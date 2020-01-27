<template>
    <page-header-layout>

        <v-ons-splitter>
            <v-ons-toast class="arches" :visible.sync="toastVisible" animation="fall">
              {{syncErrorMessage}}
              <button @click="toastVisible = false">x</button>
            </v-ons-toast>
            <v-ons-splitter-side width="80%"
                collapse="" side="right"
                :open.sync="showSideNav" class="sidenav toolbar-header">
                <v-ons-page>
                    <v-ons-list v-if="showAllProjectsMenuContent">
                        <v-ons-list-item class="panel-header">
                            <span class="panel-header-text label right-panel-label">All Projects</span>
                        </v-ons-list-item>
                        <v-ons-list-item tappable @click='toggleShowUnjoined'>
                            <v-ons-icon class="text-color-dark left menu-icon" icon="fa-eye" v-if="showUnjoinedProjects === false"></v-ons-icon>
                            <v-ons-icon class="text-color-dark left menu-icon" icon="fa-eye-slash" v-else></v-ons-icon>
                            <div class="menu-text" v-if="showUnjoinedProjects === false">
                                <span class="text-color-dark">Show all projects</span>
                                <span class="menu-subtext">List all projects regardless of status</span>
                            </div>
                            <div class="menu-text" v-else>
                                <span class="text-color-dark">Show only projects I've downloaded</span>
                                <span class="text-color-dark menu-subtext">List all projects ready for data collection</span>
                            </div>
                        </v-ons-list-item @click="">
                        <v-ons-list-item tappable @click="$ons.notification.confirm({message: 'Deleting a project will remove all related data (synced and unsynced) from your device?. Are you sure you want to proceed?', callback: deleteAllInactiveProjects})">
                            <v-ons-icon class="text-color-dark left menu-icon" icon="fa-trash"></v-ons-icon>
                            <div class="menu-text">
                                <span class="text-color-dark">Delete all inactive projects</span>
                                <span class="text-color-dark menu-subtext">Remove all inactive projects from my device</span>
                            </div>
                        </v-ons-list-item @click="">
                    </v-ons-list>

                    <v-ons-list v-else>
                        <v-ons-list-item class="panel-header">
                            <span class="panel-header-text label right-panel-label" v-if="selectedProject">{{selectedProject.name}}</span>
                        </v-ons-list-item @click="">
                        <v-ons-list-item tappable @click="sync" v-if="selectedProject && !selectedProject.unavailable && selectedProject.joined && selectedProject.active">
                            <v-ons-icon class="text-color-dark left menu-icon" icon="fa-cloud-download-alt"></v-ons-icon>
                            <div class="menu-text">
                                <span class="text-color-dark">Sync all records in this project</span>
                                <span class="menu-subtext">Sync all project data</span>
                                <span v-if="syncfailed" class="text-color-dark menu-subtext">Sync Failed... please try again.</span>
                            </div>
                        </v-ons-list-item @click="">
                        <v-ons-progress-bar indeterminate v-if="syncing"></v-ons-progress-bar>
                        <v-ons-list-item tappable v-if="selectedProject && !selectedProject.unavailable && selectedProject.joined && selectedProject.active" @click="$ons.notification.confirm({message: 'Are you sure you want to leave this project?. If you leave, this project will not sync with the remote server unless you rejoin.', callback: toggleProjectParticipation})">
                            <v-ons-icon class="text-color-dark left menu-icon" icon="fa-toggle-off"></v-ons-icon>
                            <div class="menu-text">
                                <span class="text-color-dark">Leave project</span>
                                <span class="menu-subtext">Stop participating in this active project</span>
                            </div>
                        </v-ons-list-item @click="">
                        <v-ons-list-item tappable v-if="selectedProject && !selectedProject.joined && selectedProject.active" @click="function(){toggleProjectParticipation(1)}">
                            <v-ons-icon class="text-color-dark left menu-icon" icon="fa-toggle-off"></v-ons-icon>
                            <div class="menu-text">
                                <span class="text-color-dark">Re-join project</span>
                                <span class="menu-subtext">Resume participating in this active project</span>
                            </div>
                        </v-ons-list-item @click="">
                        <v-ons-list-item tappable v-if="selectedProject && (selectedProject.unavailable || !selectedProject.active)" @click="$ons.notification.confirm({message: 'Are you sure you want to delete this Project? All unsynced data will be lost.', callback: deleteProject})">
                            <v-ons-icon class="text-color-dark left menu-icon" icon="fa-trash"></v-ons-icon>
                            <div class="menu-text">
                                <span class="text-color-dark">Delete this project from my device</span>
                                <span class="menu-subtext">Remove inactive project from my device</span>
                            </div>
                        </v-ons-list-item @click="">
                        <v-ons-list-item tappable v-if="selectedProject && selectedProject.active && !selectedProject.unavailable && selectedProject.joined" v-bind:disabled="selectedProject.hasofflinebasemaps === false" @click="toggleMapSource">
                            <v-ons-icon class="text-color-dark left menu-icon" v-if="selectedProject.useonlinebasemaps === true" icon="fa-toggle-off"></v-ons-icon>
                            <v-ons-icon class="text-color-dark left menu-icon" v-if="selectedProject.useonlinebasemaps === false" icon="fa-toggle-on"></v-ons-icon>
                            <v-ons-icon class="text-color-dark left menu-icon" v-if="selectedProject.useonlinebasemaps === undefined" icon="fa-globe"></v-ons-icon>
                            <div class="menu-text">
                                <span class="text-color-dark">Use offline maps</span>
                                <span class="menu-subtext" v-if="selectedProject.hasofflinebasemaps">Use your projects offline basemap</span>
                                <span class="menu-subtext" v-else>The project does not have an offline basemap</span>
                            </div>
                        </v-ons-list-item @click="">
                    </v-ons-list>
                </v-ons-page>
            </v-ons-splitter-side>

        <v-ons-splitter-content>
            <v-ons-page>
                <v-ons-toolbar class="project-list-toolbar" modifier="longdivider">
                    <span class="left projects-title"><span>Projects</span></span>
                    <div class="center"></div>
                    <div class="right">
                        <v-ons-toolbar-button @click="toggleSideNav()">
                            <v-ons-icon class="text-color-dark project-name" style="font-size: 17px;" icon="fa-bars"></v-ons-icon>
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
                    <v-ons-progress-bar indeterminate v-if="updating"></v-ons-progress-bar>
                    <v-ons-progress-bar indeterminate v-if="syncing"></v-ons-progress-bar>
                    <v-ons-list-item tappable modifier="longdivider" v-for="project in projects" :key="project.id" v-bind:class="{ deleted: project.unavailable || !project.active, unjoined: project.joined === false }">
                        <span class="left" style="display: flex; flex-direction: column; align-items: baseline; line-height: 1.1em; border-style: 1px; background-color: light-blue; border-color: dark-blue;" @click="segueToProject(project);">
                            <span class="left-project-text" v-if="project.joined === false && project.active">You've left this project</span>
                            <span class="project-name">{{project.name}}</span>
                            <span v-if="project.joined !== false && project.active && !project.unavailable">
                                <span class="project-name deleted"></span>
                                <span class="project-active">Active from:</span>
                                <span class="project-dates">{{project.startdate}} to {{project.enddate}}</span>
                            </span>
                            <span v-if="!project.active && !project.unavailable">
                                <span class="project-name deleted"></span>
                                <span class="project-active">Inactive</span>
                            </span>
                            <span v-if="project.unavailable">
                                <span class="project-name deleted"></span>
                                <span class="project-active">Deleted</span>
                            </span>
                        </span>
                        <span class="center" @click="segueToProject(project);"></span>
                        <v-ons-icon class="right" style="display: flex; padding-left:10px; padding-right: 18px;" icon="fa-ellipsis-v" v-if="project.joined !== undefined || !project.active" @click="toggleSideNav(project)"></v-ons-icon>

                        <v-ons-icon class="right" style="display: flex; padding-left:10px" icon="fa-cloud-download-alt" v-if="project.joined === undefined && project.active && !project.unavailable" @click="function(){selectedProject = project; sync()}"></v-ons-icon>
                        <v-ons-icon class="right" style="display: flex; padding-left:10px" icon="fa-trash" v-if="project.unavailable" @click="function(){selectedProject = project; deleteProject(1); refreshProjectList()}"></v-ons-icon>
                    </v-ons-list-item>
                    <v-ons-list-item v-if="projects.length === 0">
                        <div class="summary-panel relative">
                            <div class="icon-circle">
                              <v-ons-icon class="pull-icon" icon="fa-cloud-download"></v-ons-icon>
                            </div>
                            <div class="">
                                No projects downloaded from this Arches app.<br>
                                Pull down to sync...
                            </div>
                        </div>
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
            updating: false,
            syncfailed: false,
            selectedProject: undefined,
            showAllProjectsMenuContent: true,
            toastVisible: false,
            syncErrorMessage: '',
            showUnjoinedProjects: true
        };
    },
    computed: {
        server() {
            return this.$store.getters.activeServer;
        },
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
                        if (projectStatus[p.id]) {
                            p.useonlinebasemaps = projectStatus[p.id].useonlinebasemaps;
                        }
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
            var userProjectStatus = false;
            if (this.server) {
                if (this.server.user_preferences[this.server.user.id]) {
                    userProjectStatus = this.$store.getters.activeServer.user_preferences[this.server.user.id].projects;
                }
            }
            return userProjectStatus;
        },
        toggleSideNav: function(project, showSideNavOverride) {
            this.showAllProjectsMenuContent = !project;
            this.selectedProject = project;
            this.showSideNav = showSideNavOverride !== undefined ? showSideNavOverride : !this.showSideNav;
        },
        toggleShowUnjoined: function(project) {
            this.showUnjoinedProjects = !this.showUnjoinedProjects;
            this.$store.commit('updateUserPrefByKey', {'userPrefKey': 'showUnjoinedProjects', 'userPref': this.showUnjoinedProjects});
        },
        sync: function() {
            var self = this;
            this.syncing = true;
            this.syncfailed = false;
            this.$store.dispatch('syncRemote', {'projectId': this.selectedProject.id})
                .catch(function(err) {
                    console.log(err);
                    self.syncfailed = true;
                    self.syncErrorMessage = err.notification ? err.notification : "Error. Unable to sync survey";
                    self.toastVisible = true;
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
                        self.syncErrorMessage = "Delete failed.";
                    })
                    .finally(function(doc) {
                        var index;
                        self.projects.forEach((p, i) => { if (self.selectedProject.id === p.id) index = i });
                        window.setTimeout(function() {
                            self.toggleSideNav(undefined, false)
                            self.projects = self.projects.splice(index, 1)
                        }, 250);
                    });
            } else {
                console.log('not deleting project');
            }
        },
        toggleMapSource: function() {
            this.getProjectStatus();
            this.$store.dispatch('toggleBasemapSource', this.selectedProject.id)
                .catch(function() {
                    console.log('failed switch source');
                });
            this.selectedProject.useonlinebasemaps = this.$store.getters.activeServer.user_preferences[this.server.user.id].projects[this.selectedProject.id].useonlinebasemaps
            console.log(this.selectedProject.useonlinebasemaps);
        },
        deleteAllInactiveProjects: function(answer){
            var self = this;
            if (answer === 1) {
                self.projects.forEach(function(project){
                    if (!project.active) {
                        self.$store.dispatch('deleteProject', project.id)
                        .catch(function() {
                            console.log('delete failed');
                            self.syncErrorMessage = "Delete failed.";
                        });
                    }
                    window.setTimeout(function() {
                        self.toggleSideNav()
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
                        window.setTimeout(function() {
                            self.toggleSideNav();
                        }, 150);
                    }, this);
            } else {
                console.log('you are not leaving');
            }
        },
        refreshProjectList(done) {
            var self = this, server = this.server || "";
            this.updating = true;
            this.$store.dispatch('getUserProfile', server)
            .then(function(response){
                if (response.ok) {
                    return response.json();
                } else {
                    if (response.status === 401) {
                        self.error_message = 'The supplied username or password was not valid.';
                    } else {
                        self.error_message = self.default_error_message;
                    }
                }

                throw new Error('Network response was not ok.');
            })
            .then(function(response){
                self.server.user = response;
                return self.$store.dispatch('updateRemoteProjectsStatus', self.server);
            })
            .finally(function(){
                try {
                    done();
                } catch(err) {
                    // do nothing
                }
                window.setTimeout(function() {
                    if (!!self.updating) {
                        self.updating = false;
                    }
                }, 1000);
            });
        }
    },
    created: function() {
        if (this.server) {
            if ('showUnjoinedProjects' in this.server.user_preferences[this.server.user.id]){
                this.showUnjoinedProjects = this.server.user_preferences[this.server.user.id]['showUnjoinedProjects'];
            } else {
                this.showUnjoinedProjects = true;
            }
            this.refreshProjectList();
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
        font-size: 17px;
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
      background-color: #f0f0f0;
    }

    ons-list-item.unjoined .project-name {
      color: #888;
    }

    ons-list-item.unjoined .project-dates {
      color: #999;
    }

    .left-project-text{
        color: #555;
        font-weight: 500;
        font-size: 15px;
    }

    .left-project-text + .project-name {
        font-size: 12px;
        padding-top: 2px;
    }

    .project-list-toolbar {
        background: #f4f4f4;
        border-bottom: 1px solid #ddd;
    }

    .menu-subtext {
        font-size: 12px;
        color: #888;
    }

    .list-item {
        border-bottom: 1px solid #eee;
    }

    .panel-header {
      background: #efeff4;
      margin-top: 1px;
    }

    .panel-header-text {
        color: #2E4172;
        font-weight: 500;
        font-size: 15px;
    }

    .list-item--material .panel-header-text {
        font-weight: 600;
        padding: 5px;
    }

    .relative {
        position: relative;
    }

    .summary-panel {
      margin: 5px;
      min-height: 100px;
      width: 100%;
      text-align: center;
      padding: 20px 10px;
      font-size: 13px;
      color: #888;
    }

    .icon-circle {
        margin-left: 40%;
        margin-bottom: 20px;
        box-sizing: border-box;
        border: solid 1px steelblue;
        border-radius: 50%;
        height: 60px;
        width: 60px;
        background: #F5FAFE;
    }

    .pull-icon {
        color: steelblue;
        padding-top: 15px;
        padding-left: 3px;
        font-size: 24px;
    }


</style>
