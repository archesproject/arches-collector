import Vue from 'vue';
import Vuex from 'vuex';
import PouchDB from 'pouchdb';
import PouchDBupsert from 'pouchdb-upsert';

Vue.use(Vuex);
PouchDB.plugin(PouchDBupsert);

var localDB = {
    servers: new PouchDB('app_servers')
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
            var appServers = state.dbs.app_servers;
            return appServers.servers[appServers.active] || undefined;
        },
        currentProjects: function(state, getters) {
            if(!getters.activeServer){
                return;
            }
            return getters.activeServer.projects;
        }
    },
    mutations: {
        hydrateAppServers(state, value) {
            state.dbs.app_servers = value;
        },
        setActiveServer(state, value) {
            state.dbs.app_servers.active = value;
        },
        addMockProject(state, value) {
            var appServers = state.dbs.app_servers;
            var activeServer = appServers.servers[appServers.active];
            var project = {
                name: 'Project',
                status: 'active'
            };
            activeServer.projects.push(project);
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
        initAppServers({ commit, state }) {
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
        upsertAppServer({commit, state}, doc) {
            return localDB.servers.upsert('servers', function(serverDoc) {
                serverDoc.active = doc.url;
                serverDoc.servers[doc.url] = doc;
                serverDoc.servers[doc.url].projects = []; // should we update this?

                commit('hydrateAppServers', serverDoc);
                return serverDoc;
            });
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
            projects: [
                list of project objects????
                {
                    id,
                    name,
                    etc..
                }
            ]
        }
    }
}

*/
