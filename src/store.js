import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
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
