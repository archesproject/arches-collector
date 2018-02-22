import Vue from 'vue';
import Vuex from 'vuex';
import PouchDB from 'pouchdb';
import PouchDBupsert from 'pouchdb-upsert';

Vue.use(Vuex);
PouchDB.plugin(PouchDBupsert);

var localDB = {
    servers: new PouchDB('app_servers')
};

var getActiveServer = function(state) {
    var appServers = state.dbs.app_servers;
    return getServer(state, appServers.active);
};
var getServer = function(state, url) {
    var appServers = state.dbs.app_servers;
    return appServers.servers[url] || undefined;
};

export default new Vuex.Store({
    state: {
        dbs: {
            app_servers: {
                _id: 'servers',
                active: null,
                servers: {}
            }
        }
    },
    getters: {
        activeServer: function(state, getters) {
            return getActiveServer(state);
        },
        currentProjects: function(state, getters) {
            if (!getters.activeServer) {
                return;
            }
            return getters.activeServer.projects;
        }
    },
    mutations: {
        hydrateAppServers: function(state, value) {
            state.dbs.app_servers = value;
        },
        setActiveServer: function(state, value) {
            state.dbs.app_servers.active = value;
        },
        updateProjects: function(state, value) {
            var server = getServer(state, value.url);
            value.projects.forEach(function(project) {
                // Vue.set(server.projects, project.id, project);
                server.projects[project.id] = project;
            });
        },
        setActiveProject: function(state, value) {
            var activeServer = getActiveServer(state);
            activeServer.active_project = value.project_id;
        }
    },
    modules: {
        cordova: {
            namespaced: false,
            state: {
                deviceready: false
            },
            mutations: {
                deviceready(state, ready) {
                    state.deviceready = ready;
                }
            }
        }
    },
    actions: {
        initAppServers: function({ commit, state }) {
            return localDB.servers.get('servers')
            .then(function(doc) {
                // go to the last active server and project
                console.log(doc);
                commit('hydrateAppServers', doc);

                return doc;
            })
            .catch(function() {
                var doc = state.dbs.app_servers;

                return localDB.servers.put(doc)
                .finally(function(response) {
                    return state.dbs.app_servers;
                });
            });
        },
        upsertAppServer: function({commit, state}, doc) {
            return localDB.servers.upsert('servers', function(serverDoc) {
                serverDoc.active = doc.url;
                serverDoc.servers[doc.url] = doc;
                serverDoc.servers[doc.url].projects = {}; // should we update this?

                commit('hydrateAppServers', serverDoc);
                return serverDoc;
            });
        },
        getRemoteProjects: function({commit, state}, url) {
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    var projects = [{
                        name: 'SF Field Collection',
                        id: '23902938-2342302-234-2323',
                        status: 'active'
                    }, {
                        name: 'Portland Tree Survey',
                        id: '9094309034-2342302-234-1211',
                        status: 'active'
                    }];
                    var payload = {
                        url: url,
                        projects: projects
                    };
                    commit('updateProjects', payload);
                    resolve();
                }, 1000);
            });

            // return fetch(this.server.url.replace(/\/$/, '') + '/auth/get_token', {
            //     method: 'POST',
            //     body: formData,
            //     headers: new Headers({
            //         // 'Content-Type': 'text/plain'
            //         // 'Content-Type': 'application/x-www-form-urlencoded'
            //     })
            // })
            // .then(function(response) {
            //     // return the response object or throw an error
            //     console.log(response);
            //     if (response.ok) {
            //         return response.text();
            //     }
            //     throw new Error('Network response was not ok.');
            // })
            // .then(function(response) {
            //     // set the server metadata and token
            //     console.log('Success:', response);
            //     self.server.token = response;
            //     return self.$store.dispatch('upsertAppServer', self.server);
            // })
            // .then(function(res) {
            //     console.log('success in upserting a new doc');
            //     // maybe we need to go to the projects page and load/update the list of projects
            //     self.$router.push({'name': 'projectlist'});
            // })
            // .catch(function(error) {
            //     console.log('Error:', error);
            //     self.error = true;
            // });
        }
    }
});

/*
'servers' object def:

{
    active: server_url,
    servers: {
        server_url: {
            url: server_url,
            nickname: nickname,
            username: username, <-- maybe we don't store
            password: password, <-- maybe we don't store
            token:  token,
            projects: {
                project_id: {
                    id,
                    name,
                    etc..
                }
            },
            active_project: project_id,
            project_sort: [project_id1, project_id2...]
        }
    }
}

*/
