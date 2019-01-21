import Vue from 'vue';
import Vuex from 'vuex';
import PouchDB from 'pouchdb';
import PouchDBupsert from 'pouchdb-upsert';
import PouchDBFind from 'pouchdb-find';
import SqlLiteAdapter from 'pouchdb-adapter-cordova-sqlite';

import uuidv4 from 'uuid/v4';
import underscore from 'underscore';

var $underscore = underscore;

Vue.use(Vuex);
PouchDB.plugin(PouchDBupsert);
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(SqlLiteAdapter);

var adapter = 'cordova-sqlite';

// this is mostly just for testing but this shouldn't hurt anything by being in here
// as of this writing the cordova-plugin-sqlite-2 doesn't support the browser platform
if (!window.cordova || window.cordova.platformId === 'browser') {
    adapter = 'idb';
}

var pouchDBs = (function() {
    return {
        _projectDBs: {},
        servers: 'undefined',
        // _serverConfigs: {},
        setupServer: function(config) {
            var self = this;
            this.servers = new PouchDB('app_servers', {
                adapter: adapter,
                iosDatabaseLocation: 'Library',
                auto_compaction: true
            });

            this.servers.get('servers')
                .then(function(doc) {
                    Object.keys(doc.servers).forEach(function(serverUrl) {
                        var server = doc.servers[serverUrl];
                        Object.keys(server.projects).forEach(function(projectId) {
                            self.setupProject(server, projectId);
                        });
                    });
                })
                .catch(function() {
                // no need to do anything
                    console.log('error');
                });
        },
        setupProject: function(server, projectId) {
            if (!this._projectDBs[projectId]) {
                this._projectDBs[projectId] = {};
            }
            this._projectDBs[projectId]['local'] = new PouchDB('project_' + projectId, {
                adapter: adapter,
                iosDatabaseLocation: 'Library'
            });
            this._projectDBs[projectId]['remote'] = new PouchDB(server.url + '/couchdb/project_' + projectId, {
                ajax: {
                    headers: {
                        authorization: 'Bearer ' + server.token
                        // 'X-Some-Special-Header': 'foo'
                    },
                    withCredentials: false
                }
            });
        },
        updateServerToken: function(server) {
            var self = this;
            return this.servers.get('servers')
                .then(function(doc) {
                    Object.keys(doc.servers[server.url].projects).forEach(function(projectId) {
                        self._projectDBs[projectId]['remote'] = new PouchDB(server.url + '/couchdb/project_' + projectId, {
                            ajax: {
                                headers: {
                                    authorization: 'Bearer ' + server.token
                                },
                                withCredentials: false
                            }
                        });
                    });
                });
        },
        syncProject: function(projectId) {
            return this._projectDBs[projectId]['local']
                .sync(this._projectDBs[projectId]['remote'], {
                    // live: true,
                    // retry: true
                })
                .on('complete', function() {
                // yay, we're in sync!
                    console.log('yay, we\'re in sync!');
                // viewModel.remote_data_updated(false);
                // listDocs(projectId);
                // $.get( "push_edits_to_db?projectId=" + projectId, function(data) {
                //     console.log( "Load was performed." );
                // });
                })
                // .on('change', function(info) {
                //     // handle change
                // })
                // .on('paused', function(err) {
                //     // replication paused (e.g. replication up to date, user went offline)
                // })
                // .on('active', function() {
                //     // replicate resumed (e.g. new changes replicating, user went back online)
                // })
                .on('denied', function(err) {
                    // a document failed to replicate (e.g. due to permissions)
                    console.log(err, 'denied');
                })
                .on('error', function(err) {
                // boo, we hit an error!
                    console.log(err, 'Unable to sync. Please check your data connection and try again.');
                    // if(err.status === 403) {
                    // Promise.reject(new Error(err));
                    throw err;
                    // }
                });

            // sync.cancel(); // whenever you want to cancel only if live = true
        },
        getChanges: function(projectId) {
            return this._projectDBs[projectId]['local'].changes({
                // limit: 10,
                // since: 0
            }).then(function(result) {
                // handle result
                console.log(result);
                return result;
            }).catch(function(err) {
                console.log(err);
            });
        },
        getTiles: function(projectId, resourceId) {
            return this._projectDBs[projectId]['local']
                .allDocs({include_docs: true, descending: true})
                .then(function(doc) {
                    var docs = doc.rows.map(function(x) {
                        return x.doc;
                    });
                    return docs;
                })
                .catch(function(err) {
                    console.log(err);
                });
        },
        putTile: function(projectId, tile) {
            this._projectDBs[projectId]['local']
                .changes({
                    include_docs: true
                })
                .then(function(docs) {
                    console.log(docs);
                });
            return this._projectDBs[projectId]['local']
                .put(tile)
                .then(function(response) {
                    tile._rev = response.rev;
                    return response;
                })
                .catch(function(err) {
                // CATCH 409 ERROR HERE
                    console.log(err);
                });
        },
        deleteTiles: function(projectId, tiles) {
            var removedTiles = tiles.map(tile => this._projectDBs[projectId]['local'].remove(tile));
            return Promise.all(removedTiles);
        },
        putResource: function(projectId, resource) {
            this._projectDBs[projectId]['local']
                .changes({
                    include_docs: true
                })
                .then(function(docs) {
                    console.log(docs);
                });
            return this._projectDBs[projectId]['local']
                .put(resource)
                .then(function(response) {
                    resource._rev = response.rev;
                    return response;
                })
                .catch(function(err) {
                // CATCH 409 ERROR HERE
                    console.log(err);
                });
        },
        getResources: function(projectId, instances) {
            var query;
            if (!instances) {
                query = {
                    type: 'resource'
                };
            } else {
                query = {
                    type: 'resource',
                    resourceinstanceid: {
                        $in: instances
                    }
                };
            };
            return this._projectDBs[projectId]['local'].find({
                selector: query
            }).then(function(docs) {
                return docs;
            }).catch(function(err) {
                console.log(err);
            });
        },
        getResourcesGeoJSON: function(projectId) {
            return this._projectDBs[projectId]['local'].find({
                selector: {
                    type: 'resource'
                }
            }).then(function(docs) {
                let features = [];
                for (const doc of docs.docs) {
                    for (const geom of doc.geometries) {
                        for (let feature of geom.geom.features) {
                            feature.properties.id = doc._id;
                            feature.properties.displayname = doc.displayname;
                            feature.properties.displaydescription = doc.displaydescription;
                            features.push(feature);
                        }
                    }
                }
                return {
                    type: 'FeatureCollection',
                    features: features
                };
            }).catch(function(err) {
                console.log(err);
            });
        }
    };
}());

/*
'servers' object def:

{
    active: server_url,
    servers: {
        server_url: {
            url: server_url,
            user: userObj,
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
            project_sort: [project_id1, project_id2...],
            active_resource: resource_instance_object
            active_graph_id: graph id being edited
        }
    }
}

*/

var store = new Vuex.Store({
    // strict: true,
    state: {
        dbs: {
            app_servers: {
                _id: 'servers',
                active: null,
                servers: {}
            }
        },
        tiles: []
    },
    getters: {
        activeServer: function(state, getters) {
            var appServers = state.dbs.app_servers;
            return getters.server(appServers.active);
        },
        server: function(state, getters) {
            return function(url) {
                var appServers = state.dbs.app_servers;
                return appServers.servers[url] || undefined;
            };
        },
        servers: function(state, getters) {
            return state.dbs.app_servers.servers;
        },
        currentProjects: function(state, getters) {
            if (!getters.activeServer) {
                return {};
            }
            return getters.activeServer.projects;
        },
        activeProject: function(state, getters) {
            if (!getters.activeServer) {
                return {};
            }
            var projectId = getters.activeServer.active_project;
            return getters.activeServer.projects[projectId];
        },
        tiles: function(state, getters) {
            return state.tiles.filter(tile => tile.type === 'tile');
        },
        activeGraph: function(state, getters) {
            if (!getters.activeServer) {
                return {};
            }
            var activeGraph = null;
            var graphId = store.getters.activeServer.active_graph_id;
            getters.activeProject.graphs.forEach(function(graph) {
                if (graph.graphid === graphId) {
                    activeGraph = graph;
                }
            });
            return activeGraph;
        },
        resourcesToSync: function(state, getters) {
            var project = getters.activeProject;
            if ('resources_to_sync' in project) {
                return Object.keys(project.resources_to_sync).length;
            }
            return 0;
        },
        currentGraphs: function(state, getters) {
            if (!getters.activeServer) {
                return {};
            }
            var graphs = {};
            getters.activeProject.graphs.forEach(function(graph) {
                graphs[graph.graphid] = graph;
            });
            return graphs;
        },
        getResourceDescriptors: function(state, getters) {
            return function(resource, tile) {
                var graph = getters.currentGraphs[resource.graph_id];
                var user = getters.activeServer.user;
                var graphFunction = null;
                graph.functions.forEach(function(func) {
                    if (func.function_id === '60000000-0000-0000-0000-000000000001') {
                        graphFunction = func;
                    }
                });
                if (!!graphFunction) {
                    var tiles = !!tile ? [tile] : [];
                    var ret = {};
                    if (!!resource.resourceinstanceid && tiles.length === 0) {
                        tiles = $underscore.filter(getters.tiles, function(tile) {
                            return tile.resourceinstance_id === resource.resourceinstanceid;
                        }, this);
                    }
                    ['name', 'description', 'map_popup'].forEach(function(descriptor) {
                        var config = graphFunction.config[descriptor];
                        ret[descriptor] = config['string_template'];
                        if ('nodegroup_id' in config && !!config.nodegroup_id) {
                            tiles = $underscore.filter(tiles, function(tile) {
                                return tile.nodegroup_id === config.nodegroup_id;
                            }, this);
                            tiles = $underscore.sortBy(tiles, 'sortorder');
                            tile = tiles[0];
                            if (!!tile) {
                                var tileData = tile.data;
                                if (!!tile.provisionaledits && !!tile.provisionaledits[user.id]) {
                                    tileData = tile.provisionaledits[user.id]['value'];
                                }
                                graph.nodes.forEach(function(node) {
                                    if (node.nodeid in tileData) {
                                        if (['string'].indexOf(node.datatype) > -1) {
                                            var dataValue = tileData[node.nodeid];
                                            if (node.datatype === 'concept') {
                                                // maybe we can implement in the future
                                            }
                                            ret[descriptor] = ret[descriptor].replace('<' + node.name + '>', dataValue);
                                        }
                                    }
                                });
                            }
                        }
                    });
                }
                return ret;
            };
        }
    },
    mutations: {
        addNewServer: function(state, newServer) {
            newServer.active_project = '';
            newServer.active_graph_id = '';
            newServer.active_resource = null;
            newServer.card_nav_stack = [];
            newServer.user_project_status = {};
            newServer.user_project_status[newServer.user.id] = {};
            if (typeof store.getters.server(newServer.url) === 'undefined') {
                Vue.set(state.dbs.app_servers.servers, newServer.url, newServer);
            } else {
                state.dbs.app_servers.servers[newServer.url] = newServer;
            }
            store.commit('setActiveServer', newServer.url);
            store.dispatch('saveServerInfoToPouch');
        },
        // updateServer: function(state, serverObj) {
        //     if (typeof store.getters.server(serverObj.url) !== 'undefined') {
        //         Object.keys(serverObj).forEach(function(serverProps) {
        //             state.dbs.app_servers.servers[serverObj.url][serverProps] = serverObj[serverProps];
        //         });
        //         store.dispatch('saveServerInfoToPouch');
        //     }
        // },
        deleteServer: function(state, serverurl) {
            Object.keys(state.dbs.app_servers.servers[serverurl].projects).forEach(function(projectid) {
                store.dispatch('deleteProject', projectid);
            });
            delete state.dbs.app_servers.servers[serverurl];
            store.dispatch('saveServerInfoToPouch', serverurl);
        },
        setActiveServer: function(state, value) {
            state.dbs.app_servers.active = value;
            store.dispatch('saveServerInfoToPouch');
        },
        updateProjects: function(state, serverDoc) {
            var server = store.getters.server(serverDoc.url);
            var remoteProjectIds = serverDoc.projects.map(function(p) { return p.id; });
            for (var projectid in server.projects) {
                Vue.set(server.projects[projectid], 'deleted', false);
                if (remoteProjectIds.indexOf(projectid) < 0) {
                    server.projects[projectid].deleted = true;
                }
            };

            serverDoc.projects.forEach(function(project) {
                // if (server.projects.hasOwnProperty(project.id) === false) {
                Vue.set(server.projects, project.id, project);
                // }
            });
            store.dispatch('saveServerInfoToPouch');
        },
        setActiveProject: function(state, value) {
            store.getters.activeServer.active_project = value.project_id;
            store.dispatch('getTiles', value.project_id)
                .then(function(doc) {
                    return doc;
                });
        },
        setActiveResourceInstance: function(state, value) {
            store.getters.activeServer.active_resource = value;
        },
        clearActiveResourceInstance: function(state) {
            store.getters.activeServer.active_resource = null;
        },
        setActiveGraphId: function(state, value) {
            store.getters.activeServer.active_graph_id = value;
        },
        identifyDeletedProjects: function(state) {
            this.currentProjects();
        },
        setLastProjectSync: function(state, projectId) {
            var now = new Date();
            var server = store.getters.activeServer;
            function pad(n, width, z) {
                z = z || '0';
                n = n + '';
                return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
            }
            Vue.set(store.getters.currentProjects[projectId].lastsync, 'date', now.toISOString().split('T')[0].replace(/-/g, '/'));
            Vue.set(store.getters.currentProjects[projectId].lastsync, 'time', pad(now.getHours(), 2) + ':' + pad(now.getMinutes(), 2));
            if (server.user_project_status[server.user.id][projectId] === undefined) {
                server.user_project_status[server.user.id][projectId] = {joined: true};
            }
            store.dispatch('saveServerInfoToPouch');
        },
        updateResourceEditDateAndDescriptors: function(state, resource) {
            var date = new Date();
            resource['edited'] = {
                'day': date.toDateString(),
                'time': date.toTimeString()
            };
            var descriptors = store.getters.getResourceDescriptors(resource);
            if (!!descriptors) {
                resource.displayname = descriptors.name;
                resource.displaydescription = descriptors.description;
                resource.map_popup = descriptors.map_popup;
            }
            return resource;
        },
        addTile: function(state, value) {
            state.tiles.push(value);
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
        saveServerInfoToPouch: function({commit, state}) {
            var appServers = state.dbs.app_servers;
            return pouchDBs.servers.upsert('servers', function(serverDoc) {
                serverDoc = appServers;
                return serverDoc;
            });
        },
        toggleProjectParticipation: function(state, projectId) {
            var server = this.getters.activeServer;
            if (server.user_project_status[server.user.id] === undefined) {
                server.user_project_status[server.user.id] = {};
            }
            if (server.user_project_status[server.user.id][projectId] === undefined) {
                server.user_project_status[server.user.id][projectId] = {joined: false};
            } else {
                server.user_project_status[server.user.id][projectId].joined = !server.user_project_status[server.user.id][projectId].joined;
            }
            store.dispatch('saveServerInfoToPouch');
        },
        deleteProject: function(state, projectId) {
            pouchDBs._projectDBs[projectId]['local'].destroy(function(err, response) {
                if (err) {
                    return console.log(err);
                } else {
                    store.dispatch('deleteProjectBasemaps', projectId);
                    if (store.getters.activeServer.projects[projectId]) {
                        delete store.getters.activeServer.projects[projectId];
                        var server = store.getters.activeServer;
                        if (server.user_project_status[server.user.id] && server.user_project_status[server.user.id][projectId]) {
                            delete server.user_project_status[server.user.id][projectId];
                        }
                        store.dispatch('saveServerInfoToPouch');
                    }
                }
            });
        },
        getClientId: function({commit, state}, {url, username, password}) {
            var self = this;
            self.error = false;

            var formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            return fetch(url.replace(/\/$/, '') + '/auth/get_client_id', {
                method: 'POST',
                body: formData,
                headers: new Headers({
                    // 'Content-Type': 'text/plain'
                    // 'Content-Type': 'application/x-www-form-urlencoded'
                })
            });
        },
        getToken: function({commit, state}, {url, username, password, client_id}) {
            var self = this;
            self.error = false;

            var formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            formData.append('grant_type', 'password');
            formData.append('client_id', client_id);

            return fetch(url.replace(/\/$/, '') + '/o/token/', {
                method: 'POST',
                body: formData,
                headers: new Headers({
                    // 'Content-Type': 'text/plain'
                    // 'Content-Type': 'application/x-www-form-urlencoded'
                })
            });
        },
        refreshToken: function({commit, state}) {
            var server = store.getters.activeServer;
            var formData = new FormData();
            formData.append('refresh_token', server.refresh_token);
            formData.append('grant_type', 'refresh_token');
            formData.append('client_id', server.client_id);

            return fetch(server.url.replace(/\/$/, '') + '/o/token/', {
                method: 'POST',
                body: formData,
                headers: new Headers({
                    // 'Content-Type': 'text/plain'
                    // 'Content-Type': 'application/x-www-form-urlencoded'
                })
            })
                .then(function(response) {
                    if (response.ok) {
                        return response.json();
                    } else if (response.status === 401) {
                        return store.dispatch('getToken', server)
                            .then(function(response) {
                                if (response.ok) {
                                    return response.json();
                                }
                            });
                    }

                    throw new Error('Network response was not ok.  In refreshToken method.');
                })
                .then(function(response) {
                    server.token = response.access_token;
                    server.refresh_token = response.refresh_token;
                    return store.dispatch('updateToken', server);
                });
        },
        updateToken: function({commit, state}, server) {
            pouchDBs.updateServerToken(server);
            return store.dispatch('saveServerInfoToPouch');
        },
        syncRemote: function({commit, state}, {projectId, syncAttempts}) {
            return pouchDBs.syncProject(projectId)
                .then(function() {
                    var server = store.getters.activeServer;
                    return fetch(server.url + '/sync/' + projectId, {
                        method: 'GET',
                        headers: new Headers({
                            'Authorization': 'Bearer ' + server.token
                        })
                    });
                })
                .then(function(response) {
                    if (response.ok) {
                        return store.dispatch('getTiles', projectId);
                    } else {
                        throw response;
                    }
                })
                .then(function() {
                    return store.commit('setLastProjectSync', projectId);
                })
                .catch(function(err) {
                    if (err.status === 403) {
                        var count = syncAttempts === undefined ? 0 : syncAttempts + 1;
                        // console.log('syncAttempts:', count);
                        if (count < 6) {
                            return store.dispatch('refreshToken')
                                .then(function() {
                                    return store.dispatch('syncRemote', {'projectId': projectId, 'syncAttempts': count});
                                });
                        }
                    }
                    throw err;
                });
        },
        initServerStoreFromPouch: function({ commit, state }) {
            pouchDBs.setupServer();
            return pouchDBs.servers.get('servers')
                .then(function(doc) {
                    // go to the last active server and project
                    state.dbs.app_servers = doc;
                    return doc;
                })
                .catch(function() {
                    var doc = state.dbs.app_servers;

                    return pouchDBs.servers.put(doc)
                        .finally(function(response) {
                            return state.dbs.app_servers;
                        });
                });
        },
        getRemoteProjects: function({commit, state}, server) {
            var self = this;
            return fetch(server.url + '/surveys', {
                method: 'GET',
                headers: new Headers({
                    'Authorization': 'Bearer ' + server.token
                })
            })
                .then(function(response) {
                    // return the response object or throw an error;
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error('Network response was not ok.');
                })
                .then(function(json) {
                    // return the response object or throw an error
                    json.forEach(function(project) {
                        pouchDBs.setupProject(server, project.id);
                        // pouchDBs.syncProject(project.id);
                        project.lastsync = {
                            date: '',
                            time: ''
                        };
                        project.resources_to_sync = {};
                        project.resources_with_conflicts = {};
                    });
                    store.dispatch('initServerStoreFromPouch')
                        .finally(function(doc) {
                            commit('updateProjects', {
                                url: server.url,
                                projects: json
                            });
                        });
                    return json;
                })
                .catch(function(error) {
                    console.log('Error:', error);
                    self.error = true;
                });
        },
        getProjectChanges: function({commit, state}, projectId) {
            return pouchDBs.getChanges(projectId);
        },
        getTiles: function({commit, state}, projectId) {
            return pouchDBs.getTiles(projectId)
                .then(function(tiles) {
                    state.tiles = tiles;
                    return state.tiles;
                });
        },
        persistTile: function({commit, state}, tile) {
            var tileid = uuidv4();
            var addTile = false;
            var newResource = false;
            if (!tile.tileid) {
                tile.tileid = tileid;
                tile._id = tileid;
                addTile = true;
            }
            if (!tile.resourceinstance_id) {
                tile.resourceinstance_id = uuidv4();
                newResource = true;
            }
            var project = store.getters.activeProject;
            return pouchDBs.putTile(project.id, tile)
                .then(function(doc) {
                    var resource;
                    if (addTile) {
                        commit('addTile', tile);
                        if (newResource) {
                            var graph = store.getters.activeGraph;
                            resource = {
                                displaydescription: '',
                                displayname: '',
                                geometries: [],
                                graph_id: graph.graphid,
                                map_popup: '',
                                point: [],
                                provisional_resource: 'true',
                                resourceinstanceid: tile.resourceinstance_id,
                                root_ontology_class: graph.root.ontologyclass,
                                type: 'resource',
                                _id: tile.resourceinstance_id
                            };
                            commit('updateResourceEditDateAndDescriptors', resource);
                            commit('addTile', resource);
                            commit('setActiveResourceInstance', resource);
                            Vue.set(store.getters.currentProjects[project.id].resources_to_sync, tile.resourceinstance_id, false);
                            store.dispatch('persistResource', resource);
                        }
                    }
                    if (!newResource) {
                        resource = store.getters.activeServer.active_resource;
                        commit('updateResourceEditDateAndDescriptors', resource);
                        Vue.set(store.getters.currentProjects[project.id].resources_to_sync, tile.resourceinstance_id, false);
                        store.dispatch('persistResource', resource);
                    }

                    return tile;
                });
        },
        deleteTile: function({commit, state}, tile) {
            var childTiles = [tile];
            var getChildTiles = function(parentTile) {
                state.tiles.forEach(function(tile) {
                    if (tile.type === 'tile' && tile.parenttile_id === parentTile.tileid) {
                        childTiles.push(tile);
                        getChildTiles(tile);
                    }
                });
                return childTiles;
            };
            getChildTiles(tile);
            console.log('childTiles', childTiles);

            var project = store.getters.activeProject;
            return pouchDBs.deleteTiles(project.id, childTiles)
                .then(function() {
                    return store.dispatch('getTiles', project.id)
                        .then(function(tiles) {
                            var resource = store.getters.activeServer.active_resource;
                            commit('updateResourceEditDateAndDescriptors', resource);
                            return store.dispatch('persistResource', resource);
                        });
                })
                .catch(function(err) {
                    console.log(err);
                });
        },
        persistResource: function({commit, state}, resource) {
            var project = store.getters.activeProject;
            return pouchDBs.putResource(project.id, resource)
                .then(function(doc) {
                    return doc;
                });
        },
        getProjectResourcesGeoJSON: function({commit, state}, projectId) {
            return pouchDBs.getResourcesGeoJSON(projectId);
        },
        getProjectResources: function({commit, state}, projectId) {
            return pouchDBs.getResources(projectId);
        },
        getResource: function({commit, state}, ids) {
            var resources = pouchDBs.getResources(ids.projectid, [ids.resourceid]);
            return resources;
        },
        getBasemapTarget: function() {
            return new Promise((resolve, reject) => {
                if (window.device && window.device.platform === 'Android') {
                    return window.resolveLocalFileSystemURL(
                        window.cordova.file.applicationStorageDirectory,
                        (dir) => {
                            dir.getDirectory(
                                'databases',
                                {create: true},
                                (subdir) => {
                                    resolve(subdir);
                                }
                            );
                        },
                        reject
                    );
                } else if (window.device && window.device.platform === 'iOS') {
                    return window.resolveLocalFileSystemURL(
                        window.cordova.file.documentsDirectory,
                        resolve,
                        reject
                    );
                } else {
                    reject(new Error('Platform not supported. Map tiles only available on iOS or Android'));
                }
            });
        },
        deleteProjectBasemaps: function({commit, state}, projectid) {
            const mbtilesFile = `${projectid}.mbtiles`;
            store.dispatch('getBasemapTarget').then((target) => {
                return new Promise((resolve, reject) => {
                    target.getFile(mbtilesFile, {create: false}, function(filetoremove) {
                        console.log(filetoremove.toURL());
                        filetoremove.remove(function(file) {
                            console.log('file deleted');
                        });
                    });
                }).catch(error => { console.log(error.message, 'mbtiles file found'); });
            });
        },
        setupProjectBasemaps: function({commit, state}, project) {
            const mbtilesFile = `${project.id}.mbtiles`;
            store.dispatch('getBasemapTarget').then((target) => {
                return new Promise((resolve, reject) => {
                    target.getFile(mbtilesFile, {}, resolve, reject);
                }).catch(() => {
                    return new Promise((resolve, reject) => {
                        new window.FileTransfer().download(
                            encodeURI(project.tilecache),
                            target.toURL() + mbtilesFile,
                            resolve,
                            reject,
                            true
                        );
                    }).catch(error => { console.log(error.message, 'Be sure your project has an mbtiles file url'); });
                });
            });
        }
    }
});

export default store;
