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
        syncProject: function(projectId) {
            // setupDBs(projectId);

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
                // .on('denied', function(err) {
                //     // a document failed to replicate (e.g. due to permissions)
                // })
                .on('error', function(err) {
                // boo, we hit an error!
                    console.log(err, 'Unable to sync. Please check your data connection and try again.');
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
            active_resource: resource_instance_id
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
            return state.tiles;
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
                                if (!!tile.provisionaledits[user.id]) {
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
            }
        }
    },
    mutations: {
        updateAppServers: function(state, value) {
            state.dbs.app_servers = value;
        },
        addNewServer: function(state, newServer) {
            newServer.active_project = '';
            newServer.active_graph_id = '';
            newServer.active_resource = '';
            newServer.card_nav_stack = [];
            if (typeof store.getters.server(newServer.url) === 'undefined') {
                Vue.set(state.dbs.app_servers.servers, newServer.url, newServer);
            } else {
                state.dbs.app_servers.servers[newServer.url] = newServer;
            }
            store.commit('setActiveServer', newServer.url);
            store.dispatch('saveServerInfo');
        },
        deleteServer: function(state, serverurl) {
            Object.keys(state.dbs.app_servers.servers[serverurl].projects).forEach(function(projectid) {
                store.dispatch('deleteProject', projectid);
            });
            delete state.dbs.app_servers.servers[serverurl];
            store.dispatch('saveServerInfo', serverurl);
        },
        setActiveServer: function(state, value) {
            state.dbs.app_servers.active = value;
        },
        updateProjects: function(state, serverDoc) {
            var server = store.getters.server(serverDoc.url);
            var serverProjectIds = serverDoc.projects.map(function(p) { return p.id; });
            for (var projectid in server.projects) {
                if (serverProjectIds.indexOf(projectid) < 0) {
                    server.projects[projectid].deleted = true;
                }
            };
            serverDoc.projects.forEach(function(project) {
                Vue.set(server.projects, project.id, project);
            });
            store.dispatch('saveServerInfo');
        },
        setActiveProject: function(state, value) {
            store.getters.activeServer.active_project = value.project_id;
            store.dispatch('getTiles', value.project_id)
                .then(function(doc) {
                    return doc;
                });
        },
        setActiveResourceInstance: function(state, value) {
            store.getters.activeServer.active_resource = value.resourceinstanceid;
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
            function pad(n, width, z) {
                z = z || '0';
                n = n + '';
                return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
            }
            Vue.set(store.getters.currentProjects[projectId].lastsync, 'date', now.toISOString().split('T')[0].replace(/-/g, '/'));
            Vue.set(store.getters.currentProjects[projectId].lastsync, 'time', pad(now.getHours(), 2) + ':' + pad(now.getMinutes(), 2));
            store.dispatch('saveServerInfo');
        },
        updateResourceDescriptors: function(state, resourceInstanceId) {
            store.dispatch(
                'getResource', {
                    projectid: value.projectId,
                    resourceid: value.resourceInstanceId
                }
            ).then((res) => {
                var resource = res['docs'][0];
                var date = new Date();
                resource['edited'] = {
                    'day': date.toDateString(),
                    'time': date.toTimeString()
                };
                store.dispatch('persistResource', resource)
                    .then(function(doc) {
                        return doc;
                    })
                    .catch(function(err) {
                        console.log(err);
                    })
                    .finally(function() {
                        console.log('resource save finished...');
                    });
            });
        },
        setResourceAsEdited: function(state, value) {
            store.dispatch(
                'getResource', {
                    projectid: value.projectId,
                    resourceid: value.resourceInstanceId
                }
            ).then((res) => {
                var resource = res['docs'][0];
                var date = new Date();
                resource['edited'] = {
                    'day': date.toDateString(),
                    'time': date.toTimeString()
                };
                var descriptors = store.getters.getResourceDescriptors(resource);
                resource.displayname = descriptors.name;
                resource.displaydescription = descriptors.description;
                resource.map_popup = descriptors.map_popup;
                store.dispatch('persistResource', resource)
                    .then(function(doc) {
                        return doc;
                    })
                    .catch(function(err) {
                        console.log(err);
                    })
                    .finally(function() {
                        console.log('resource save finished...');
                    });
            });
            Vue.set(store.getters.currentProjects[value.projectId].resources_to_sync, value.resourceInstanceId, false);
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
        saveServerInfo: function({commit, state}) {
            var appServers = state.dbs.app_servers;
            return pouchDBs.servers.upsert('servers', function(serverDoc) {
                serverDoc = appServers;
                return serverDoc;
            });
        },
        deleteProject: function(state, projectId) {
            pouchDBs._projectDBs[projectId]['local'].destroy(function(err, response) {
                if (err) {
                    return console.log(err);
                } else {
                    store.dispatch('deleteProjectBasemaps', projectId);
                    if (store.getters.activeServer.projects[projectId]) {
                        delete store.getters.activeServer.projects[projectId];
                        store.dispatch('saveServerInfo');
                    }
                }
            });
        },
        syncRemote: function({commit, state}, projectId) {
            return pouchDBs.syncProject(projectId)
                .then(function() {
                    return store.dispatch('getTiles', projectId);
                })
                .then(function() {
                    return store.commit('setLastProjectSync', projectId);
                });
            // don't catch here, let the calling function catch and handle any error
        },
        initServerStore: function({ commit, state }) {
            pouchDBs.setupServer();
            return pouchDBs.servers.get('servers')
                .then(function(doc) {
                    // go to the last active server and project
                    commit('updateAppServers', doc);
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
                    commit('updateProjects', {
                        url: server.url,
                        projects: json
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
            pouchDBs.getTiles(projectId).then(function(tiles) {
                state.tiles = tiles;
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
                    if (addTile) {
                        commit('addTile', tile);
                        if (newResource) {
                            var graph = store.getters.activeGraph;
                            var resource = {
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
                            store.dispatch('persistResource', resource)
                                .then(function(doc) {
                                    commit('addTile', resource);
                                    commit('setActiveResourceInstance', {resourceinstanceid: tile.resourceinstance_id});
                                    commit('setResourceAsEdited', {'projectId': project.id, 'resourceInstanceId': tile.resourceinstance_id});
                                })
                                .catch(function(err) {
                                    console.log(err);
                                })
                                .finally(function() {
                                    console.log('resource save finished...');
                                });
                        }
                    }
                    if (!newResource) {
                        commit('setResourceAsEdited', {'projectId': project.id, 'resourceInstanceId': tile.resourceinstance_id});
                    }
                    return tile;
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
