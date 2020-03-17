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
var credentials = 'include';

// this is mostly just for testing but this shouldn't hurt anything by being in here
// as of this writing the cordova-plugin-sqlite-2 doesn't support the browser platform
if (!window.cordova || window.cordova.platformId === 'browser') {
    adapter = 'idb';
    credentials = 'omit';
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
            this._projectDBs[projectId].local = new PouchDB('project_' + projectId, {
                adapter: adapter,
                iosDatabaseLocation: 'Library',
                auto_compaction: true
            });
            this._projectDBs[projectId].remote = new PouchDB(server.url + '/couchdb/project_' + projectId, {
                fetch: function(url, opts) {
                    opts.credentials = credentials;
                    opts.headers.set('authorization', 'Bearer ' + server.token);
                    return PouchDB.fetch(url, opts);
                }
            });
            this._projectDBs[projectId].images = new PouchDB('images_' + projectId, {
                revs_limit: 1,
                adapter: adapter,
                iosDatabaseLocation: 'Library',
                auto_compaction: true
            });
            this._projectDBs[projectId].server = server;
        },
        updateServerToken: function(server) {
            var self = this;
            return this.servers.get('servers')
                .then(function(doc) {
                    Object.keys(doc.servers[server.url].projects).forEach(function(projectId) {
                        self._projectDBs[projectId].remote = new PouchDB(server.url + '/couchdb/project_' + projectId, {
                            fetch: function(url, opts) {
                                opts.credentials = credentials;
                                opts.headers.set('authorization', 'Bearer ' + server.token);
                                return PouchDB.fetch(url, opts);
                            }
                        });
                    });
                });
        },
        uploadToCouch: function(projectId) {
            var db = this._projectDBs[projectId];
            return db.local.replicate.to(db.remote)
                .catch(function(err) {
                    console.log(err);
                    throw new Error('Unable to upload data.  Did you go offline?');
                });
        },
        downloadFromCouch: function(projectId) {
            var db = this._projectDBs[projectId];
            return db.local.replicate.from(db.remote)
                .catch(function(err) {
                    console.log(err);
                    throw new Error('Unable to download data.  Did you go offline?');
                });
        },
        uploadImages: function(projectId) {
            var self = this;
            var server = this._projectDBs[projectId].server;
            return this._projectDBs[projectId].images
                .allDocs({ include_docs: true })
                .then(function(doc) {
                    var docs = doc.rows.map(function(x) {
                        return self.uploadImage(x.doc, server, projectId);
                    });
                    return Promise.all(docs);
                });
        },
        uploadImage: function(doc, server, projectId) {
            var self = this;
            var formData = new FormData();
            for (let [key, value] of Object.entries(doc)) {
                if (key !== '_attachments') {
                    formData.append(key, value);
                }
            }
            for (let value of Object.values(doc._attachments)) {
                self._projectDBs[projectId].images.getAttachment(doc._id, doc.file_id)
                    .then(function(blobOrBuffer) {
                        formData.append('data', blobOrBuffer, value.content_type);
                        formData.append('content_type', value.content_type);

                        return fetch(server.url.replace(/\/$/, '') + '/images', {
                            method: 'POST',
                            body: formData,
                            headers: new Headers({
                                Authorization: 'Bearer ' + server.token
                            })
                        }).then(function(response) {
                            if (response.ok) {
                                // if the images was successfully uploaded then we can remove it
                                // so that it doesn't get uploaded on subsequent sync opertations
                                self._projectDBs[projectId].images.remove(doc);
                            }
                        });
                    });
            }
        },
        base64toBlob: function(b64Data, contentType = '', sliceSize = 512) {
            const byteCharacters = atob(b64Data);
            const byteArrays = [];

            for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                const slice = byteCharacters.slice(offset, offset + sliceSize);

                const byteNumbers = new Array(slice.length);
                for (let i = 0; i < slice.length; i++) {
                    byteNumbers[i] = slice.charCodeAt(i);
                }

                const byteArray = new Uint8Array(byteNumbers);
                byteArrays.push(byteArray);
            }

            const blob = new Blob(byteArrays, {type: contentType});
            return blob;
        },
        getChanges: function(projectId) {
            return this._projectDBs[projectId].local.changes({
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
        getOnlyTiles: function(projectId) {
            var query = {
                type: 'tile'
            };
            return this._projectDBs[projectId].local.find({
                selector: query
            }).then(function(docs) {
                return docs;
            }).catch(function(err) {
                console.log(err);
            });
        },
        getAttachments: function(projectId, tile) {
            var db = this._projectDBs[projectId].local;
            var attachments = Object.keys(tile._attachments).map(attachmentid => db.getAttachment(tile.tileid, attachmentid)
                .then(function(att) { return [attachmentid, att]; }));
            return Promise.all(attachments);
        },
        getTiles: function(projectId, resourceId) {
            return this._projectDBs[projectId].local
                .allDocs({ include_docs: true, descending: true })
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
            var self = this;
            this._projectDBs[projectId].local
                .changes({
                    include_docs: true
                })
                .then(function(docs) {
                    console.log(docs);
                });

            return this.putFullImages(projectId, tile)
                .then(function() {
                    return self._projectDBs[projectId].local.put(tile);
                })
                .then(function(response) {
                    tile._rev = response.rev;
                    return response;
                })
                .catch(function(err) {
                    // CATCH 409 ERROR HERE
                    console.log(err);
                });
        },
        putFullImages: function(projectId, tile) {
            var fullSizeAttachmentsToPut = [];
            if ('_fullSizeAttachments' in tile) {
                Object.values(tile._fullSizeAttachments).forEach(function(fullSizeAttachment) {
                    fullSizeAttachment.tileid = tile.tileid;
                    fullSizeAttachmentsToPut.push(
                        this._projectDBs[projectId].images.put(fullSizeAttachment)
                    );
                }, this);
                delete tile._fullSizeAttachments;
            }
            return Promise.all(fullSizeAttachmentsToPut);
        },
        deleteFullImage: function(projectId, fileid) {
            var self = this;
            return self._projectDBs[projectId].images.get(fileid)
                .then(function(doc) {
                    return self._projectDBs[projectId].images.remove(doc);
                });
        },
        deleteDocs: function(projectId, docs) {
            var self = this;
            var removedDocs = docs.map(function(doc) {
                return self._projectDBs[projectId].local.remove(doc)
                    .then(function() {
                        var removedImages = [];
                        if (doc.type === 'tile' && '_attachments' in doc) {
                            for (let key of Object.keys(doc._attachments)) {
                                removedImages.push(self.deleteFullImage(projectId, key));
                            }
                        }
                        return Promise.all(removedImages);
                    });
            });
            return Promise.all(removedDocs);
        },
        putResource: function(projectId, resource) {
            this._projectDBs[projectId].local
                .changes({
                    include_docs: true
                })
                .then(function(docs) {
                    console.log(docs);
                });
            return this._projectDBs[projectId].local
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
            return this._projectDBs[projectId].local.find({
                selector: query
            }).then(function(docs) {
                return docs;
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
        tiles: [],
        alerts: []
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
            if (!getters.activeServer || !getters.activeProject) {
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
            if (!project) { return 0; }
            if ('resources_to_sync' in project) {
                return Object.keys(project.resources_to_sync).length;
            }
            return 0;
        },
        currentGraphs: function(state, getters) {
            if (!getters.activeServer || !getters.activeProject) {
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
                        ret[descriptor] = config.string_template;
                        if ('nodegroup_id' in config && !!config.nodegroup_id) {
                            tiles = $underscore.filter(tiles, function(tile) {
                                return tile.nodegroup_id === config.nodegroup_id;
                            }, this);
                            tiles = $underscore.sortBy(tiles, 'sortorder');
                            tile = tiles[0];
                            if (!!tile) {
                                var tileData = tile.data;
                                if (!!tile.provisionaledits && !!tile.provisionaledits[user.id]) {
                                    tileData = tile.provisionaledits[user.id].value;
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
        },
        getAlertMessage: function(state) {
            return state.alerts.length > 0 ? state.alerts[0] : false;
        },
        getSyncStatus: function(state, getters) {
            return function(projectId) {
                return getters.activeServer.projects[projectId].syncstatus;
            };
        }
    },
    mutations: {
        addNewServer: function(state, newServer) {
            newServer.active_project = '';
            newServer.active_graph_id = '';
            newServer.active_resource = null;
            newServer.card_nav_stack = [];
            newServer.user_preferences = {};
            if (typeof store.getters.server(newServer.url) === 'undefined') {
                Vue.set(state.dbs.app_servers.servers, newServer.url, newServer);
            } else {
                state.dbs.app_servers.servers[newServer.url] = newServer;
            }
            store.commit('setActiveServer', newServer.url);
            store.dispatch('saveServerInfoToPouch');
        },
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
        clearNewlyCreatedResourcesAndTiles: function(state, projectId) {
            store.getters.currentProjects[projectId].newly_created_resources = {};
            store.getters.currentProjects[projectId].newly_created_tiles = {};
        },
        setActiveGraphId: function(state, value) {
            store.getters.activeServer.active_graph_id = value;
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

            server.user_preferences[server.user.id].projects[projectId].joined = true;
            store.dispatch('saveServerInfoToPouch');
        },
        updateUserPrefByKey: function(state, { userPrefKey, userPref }) {
            var server = store.getters.activeServer;
            server.user_preferences[server.user.id][userPrefKey] = userPref;
            store.dispatch('saveServerInfoToPouch');
        },
        updateResourceEditDateAndDescriptors: function(state, resource) {
            var date = new Date();
            resource.edited = {
                day: date.toDateString(),
                time: date.toTimeString()
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
        },
        handleAlert: function(state, alertMessage) {
            state.alerts.push(alertMessage);
        },
        removeAlert: function(state) {
            state.alerts.shift();
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
        saveServerInfoToPouch: function({ commit, state }) {
            var appServers = state.dbs.app_servers;
            return pouchDBs.servers.upsert('servers', function(serverDoc) {
                serverDoc = appServers;
                return serverDoc;
            });
        },
        toggleProjectParticipation: function(state, projectId) {
            var server = this.getters.activeServer;
            server.user_preferences[server.user.id].projects[projectId].joined = !server.user_preferences[server.user.id].projects[projectId].joined;
            store.dispatch('saveServerInfoToPouch');
        },
        toggleBasemapSource: function(state, projectId) {
            var server = this.getters.activeServer;
            server.user_preferences[server.user.id].projects[projectId].useonlinebasemaps = !server.user_preferences[server.user.id].projects[projectId].useonlinebasemaps;
            store.dispatch('saveServerInfoToPouch');
        },
        deleteProject: function(state, projectId) {
            return pouchDBs._projectDBs[projectId].local.destroy()
                .then(function() {
                    return pouchDBs._projectDBs[projectId].images.destroy();
                })
                .then(function() {
                    try {
                        if (store.getters.activeServer.projects[projectId].hasofflinebasemaps) {
                            return store.dispatch('deleteProjectBasemaps', projectId);
                        }
                    } catch (err) {
                        console.log(err);
                    }
                })
                .then(function() {
                    if (store.getters.activeServer.projects[projectId]) {
                        delete store.getters.activeServer.projects[projectId];
                        var server = store.getters.activeServer;
                        if (server.user_preferences[server.user.id].projects && server.user_preferences[server.user.id].projects[projectId]) {
                            delete server.user_preferences[server.user.id].projects[projectId];
                        }
                        return store.dispatch('saveServerInfoToPouch');
                    }
                })
                .catch(function(err) {
                    console.log(err);
                });
        },
        getUserProfile: function({ commit, state }, { url, username, password }) {
            var formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);

            return fetch(url.replace(/\/$/, '') + '/auth/user_profile', {
                method: 'POST',
                body: formData
            });
        },
        getClientId: function({ commit, state }, { url, username, password }) {
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
        getToken: function({ commit, state }, { url, username, password, client_id }) {
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
        refreshToken: function({ commit, state }) {
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
        updateToken: function({ commit, state }, server) {
            pouchDBs.updateServerToken(server);
            return store.dispatch('saveServerInfoToPouch');
        },
        syncArchesFromCouch: function({ commit, state }, projectId) {
            var server = store.getters.activeServer;
            return fetch(server.url + '/sync/' + projectId, {
                method: 'GET',
                headers: new Headers({
                    Authorization: 'Bearer ' + server.token
                })
            })
                .then(function(response) {
                    if (response.ok) {
                        return response.json();
                    } else {
                        this.$store.commit('handleAlert', 'oh snap');
                    }
                });
        },
        cancelSync: function({ getters }, projectId) {
            var project = getters.activeServer.projects[projectId];
            project.cancelsync = true;
            project.syncstatus = 'Canceling sync...';
        },
        pollForSyncFinished: function({ getters }, { projectId, logid }) {
            var interval = 1000;
            var maxinterval = 30000;
            var backoffthreshold = 60000;
            var server = store.getters.activeServer;
            var project = server.projects[projectId];
            var pollingstart = new Date().getTime();

            var checkSyncStatus = function(resolve, reject) {
                // backoff algorithm to increase the polling interval
                if (new Date().getTime() > (pollingstart + backoffthreshold)) {
                    interval = Math.min(interval * 2, maxinterval);
                    pollingstart = new Date().getTime();
                }
                if (project.cancelsync) {
                    resolve({'ok': true});
                } else {
                    return fetch(server.url + '/checksyncstatus/' + logid, {
                        method: 'GET',
                        headers: new Headers({
                            Authorization: 'Bearer ' + server.token
                        })
                    })
                        .then(function(response) {
                            console.log('POLLING....', 'every', interval/1000, 'seconds');
                            if (response.ok) {
                                return response.json();
                            } else {
                                throw new Error();
                            }
                        })
                        .then(function(result) {
                            if (result.status === 'FINISHED') {
                                resolve({'ok': true});
                            } else if (result.status === 'FAILED') {
                                reject('There was an issue syncing data with Arches and couch, but your data uploaded without issue.');
                            } else {
                                setTimeout(checkSyncStatus, interval, resolve, reject);
                            }
                        })
                        .catch(function(err) {
                            console.log(err);
                            reject('There was an issue contacting the server.  Did you go offline?');
                        });
                }
            };

            return new Promise(checkSyncStatus);
        },
        syncRemote: function({ commit, state, getters }, { projectId, syncAttempts }) {
            var project = getters.activeServer.projects[projectId];
            project.cancelsync = false;
            project.syncstatus = 'Uploading to couch....';
            store.commit('clearNewlyCreatedResourcesAndTiles', projectId);
            return pouchDBs.uploadToCouch(projectId)
                .then(function(response) {
                    if (!project.cancelsync) {
                        project.syncstatus = 'Uploading images....';
                        return pouchDBs.uploadImages(projectId);
                    }
                })
                .then(function(response) {
                    if (!project.cancelsync) {
                        project.syncstatus = 'Syncing Arches with couch....';
                        return store.dispatch('syncArchesFromCouch', projectId);
                    }
                })
                .then(function(response) {
                    if (!project.cancelsync) {
                        return store.dispatch('pollForSyncFinished', {'projectId': projectId, 'logid': response.logid});
                    }
                })
                .then(function(response) {
                    if (!project.cancelsync) {
                        project.syncstatus = 'Downloading from couch....';
                        return pouchDBs.downloadFromCouch(projectId);
                    }
                })
                .then(function(response) {
                    return store.dispatch('getTiles', projectId);
                })
                .then(function() {
                    return new Promise(function(resolve, reject) {
                        project.syncstatus = 'Sync completed....';
                        store.commit('setLastProjectSync', projectId);
                        setTimeout(resolve, 1500);
                    });
                })
                .catch(function(err) {
                    console.log(err);
                    if (err.status === 403) {
                        var count = syncAttempts === undefined ? 0 : syncAttempts + 1;
                        // console.log('syncAttempts:', count);
                        if (count < 6) {
                            return store.dispatch('refreshToken')
                                .then(function() {
                                    return store.dispatch('syncRemote', { projectId: projectId, syncAttempts: count });
                                });
                        }
                    } else {
                        store.commit('handleAlert', err);
                    }
                });
        },
        initProject: function({ commit, state, getters }, { projectId, syncAttempts }) {
            return pouchDBs.downloadFromCouch(projectId)
                .then(function(response) {
                    return store.dispatch('getTiles', projectId);
                })
                .then(function() {
                    return store.commit('setLastProjectSync', projectId);
                })
                .catch(function(err) {
                    console.log(err);
                    if (err.status === 403) {
                        var count = syncAttempts === undefined ? 0 : syncAttempts + 1;
                        // console.log('syncAttempts:', count);
                        if (count < 6) {
                            return store.dispatch('refreshToken')
                                .then(function() {
                                    return store.dispatch('initProject', { projectId: projectId, syncAttempts: count });
                                });
                        }
                    } else {
                        store.commit('handleAlert', err);
                    }
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
        getRemoteProjects: function({ commit, state }, { server, surveyid }) {
            var self = this;
            var url = server.url + '/mobileprojects';
            if (!!surveyid) {
                url = url + '/' + surveyid;
            }
            return fetch(url, {
                method: 'GET',
                headers: new Headers({
                    'X-Authorization': 'Bearer ' + server.token
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
                        project.lastsync = {
                            date: '',
                            time: ''
                        };
                        project.cancelsync = false;
                        project.syncstatus = '';
                        project.syncing = false;
                        if (server.user_preferences[server.user.id] === undefined) {
                            server.user_preferences[server.user.id] = { projects: {} };
                        }
                        if (server.user_preferences[server.user.id].projects[project.id] === undefined) {
                            server.user_preferences[server.user.id].projects[project.id] = { joined: undefined, useonlinebasemaps: true };
                        }
                        project.joined = server.user_preferences[server.user.id].projects[project.id].joined;
                        project.useonlinebasemaps = server.user_preferences[server.user.id].projects[project.id].useonlinebasemaps;
                        project.hasofflinebasemaps = !!project.tilecache;
                        if (project.hasofflinebasemaps) {
                            store.dispatch(
                                'setupProjectBasemaps',
                                project
                            );
                        };
                        project.resources_to_sync = {};
                        project.resources_with_conflicts = {};
                        project.newly_created_resources = {};
                        project.newly_created_tiles = {};
                        project.image_size_limit = 5000000; // 5 Mb
                        project.thumbnail_image_size_limit = 15000; // 15 kb

                        Vue.set(server.projects, project.id, project);
                    });
                    return store.dispatch('saveServerInfoToPouch');
                })
                .then(function() {
                    // need to init the server store here or you can't
                    // navigate cards in the form
                    return store.dispatch('initServerStoreFromPouch');
                })
                .catch(function(error) {
                    console.log('Error:', error);
                    self.error = true;
                });
        },
        updateRemoteProjectsStatus: function({ commit, state }, server) {
            var self = this;
            return fetch(server.url + '/mobileprojects?status', {
                method: 'GET',
                headers: new Headers({
                    'X-Authorization': 'Bearer ' + server.token
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
                    var projectsToGet = [];
                    var projectsToDelete = [];
                    Object.keys(json).forEach(function(projectId) {
                        if (projectId in server.projects) {
                            Object.keys(json[projectId]).forEach(function(key) {
                                server.projects[projectId][key] = json[projectId][key];
                            });
                        } else {
                            // get a list of remote project that are now available
                            if (json[projectId].active) {
                                projectsToGet.push(projectId);
                            }
                        }
                    });
                    for (var projectid in server.projects) {
                        Vue.set(server.projects[projectid], 'unavailable', false);
                        if (Object.keys(json).indexOf(projectid) < 0) {
                            server.projects[projectid].unavailable = true;
                            if (server.projects[projectid].joined === undefined) {
                                // get a list of projects that should be deleted
                                projectsToDelete.push(projectid);
                            }
                        }
                    }
                    return [projectsToGet, projectsToDelete];
                })
                .then(function(result) {
                    var projectsToUpdate = [];
                    var projectIdsToGet = result[0];
                    var projectIdsToDelete = result[1];
                    projectIdsToGet.forEach(function(projectId) {
                        projectsToUpdate.push(store.dispatch('getRemoteProjects', { server: server, surveyid: projectId }));
                    });
                    projectIdsToDelete.forEach(function(projectId) {
                        projectsToUpdate.push(store.dispatch('deleteProject', projectId));
                    });
                    return Promise.all(projectsToUpdate);
                })
                .then(function() {
                    return store.dispatch('saveServerInfoToPouch');
                })
                .then(function() {
                    // need to init the server store here or you can't
                    // navigate cards in the form
                    return store.dispatch('initServerStoreFromPouch');
                })
                .catch(function(error) {
                    console.log('Error:', error);
                    self.error = true;
                });
        },
        getProjectChanges: function({ commit, state }, projectId) {
            return pouchDBs.getChanges(projectId);
        },
        getTiles: function({ commit, state }, projectId) {
            return pouchDBs.getTiles(projectId)
                .then(function(tiles) {
                    state.tiles = tiles;
                    return state.tiles;
                });
        },
        getOnlyTiles: function({ commit, state }, projectId) {
            return pouchDBs.getOnlyTiles(projectId);
        },
        getAttachments: function({ commit, state }, tile) {
            var projectid = this.getters.activeProject.id;
            return pouchDBs.getAttachments(projectid, tile);
        },
        persistTile: function({ commit, state }, tile) {
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
                            Vue.set(store.getters.currentProjects[project.id].newly_created_resources, tile.resourceinstance_id, false);
                            store.dispatch('persistResource', resource);
                            store.dispatch('saveServerInfoToPouch');
                        }
                        Vue.set(store.getters.currentProjects[project.id].newly_created_tiles, tile.tileid, false);
                    }
                    if (!newResource) {
                        resource = store.getters.activeServer.active_resource;
                        commit('updateResourceEditDateAndDescriptors', resource);
                        Vue.set(store.getters.currentProjects[project.id].resources_to_sync, tile.resourceinstance_id, false);
                        store.dispatch('persistResource', resource);
                        store.dispatch('saveServerInfoToPouch');
                    }
                    return tile;
                });
        },
        deleteTiles: function({ commit, state }, tile) {
            var childTiles = [].concat(tile);
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
            return pouchDBs.deleteDocs(project.id, childTiles)
                .then(function() {
                    Vue.delete(project.newly_created_tiles, tile.tileid);
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
        persistResource: function({ commit, state }, resource) {
            var project = store.getters.activeProject;
            return pouchDBs.putResource(project.id, resource)
                .then(function(doc) {
                    return doc;
                });
        },
        deleteResource: function({ commit, state }, resource) {
            var project = store.getters.activeProject;
            var docs = state.tiles.filter(function(tile) {
                return (tile.type === 'tile' && tile.resourceinstance_id === resource.resourceinstanceid);
            });
            docs.push(resource);
            return pouchDBs.deleteDocs(project.id, docs)
                .then(function() {
                    Vue.delete(project.newly_created_resources, resource.resourceinstanceid);
                });
        },
        getProjectResources: function({ commit, state }, projectId) {
            return pouchDBs.getResources(projectId);
        },
        getResource: function({ commit, state }, { projectId, resourceinstanceid }) {
            var resources = pouchDBs.getResources(projectId, [resourceinstanceid]);
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
                                { create: true },
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
        deleteProjectBasemaps: function({ commit, state }, projectid) {
            const mbtilesFile = `${projectid}.mbtiles`;
            store.dispatch('getBasemapTarget').then((target) => {
                return new Promise((resolve, reject) => {
                    target.getFile(mbtilesFile, { create: false }, function(filetoremove) {
                        console.log(filetoremove.toURL());
                        filetoremove.remove(function(file) {
                            console.log('file deleted');
                        });
                    });
                }).catch(error => { console.log(error.message, 'mbtiles file found'); });
            });
        },
        setupProjectBasemaps: function({ commit, state }, project) {
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
            }).finally(function(response) {
                console.log('download finished');
            });
        },
        removeFullSizeImage: function({ commit, state }, fileid) {
            var project = store.getters.activeProject;
            return pouchDBs.deleteFullImage(project.id, fileid);
        }
    }
});

export default store;
