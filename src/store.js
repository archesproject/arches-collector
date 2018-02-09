import Vue from 'vue';
import Vuex from 'vuex';
import PouchDB from 'pouchdb';

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        app_servers: new PouchDB('servers'),
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
    }
});

/*
'servers' object def:

{
    active: server_url,
    servers: [{
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
    }]
}

*/