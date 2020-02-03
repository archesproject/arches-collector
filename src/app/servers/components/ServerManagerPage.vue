<template>
    <page-header-layout>
        <v-ons-page>
            <div class="app-input-panel">

                <v-ons-progress-bar indeterminate v-if="authenticating"></v-ons-progress-bar>
                <v-ons-row class="app-details">
                    <div class="input-label">Instance URL</div>
                    <input class="input input-placeholder" placeholder="My Arches Instance URL" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" float v-model="server.url"></input>
                </v-ons-row>
                <v-ons-row class="app-details">
                    <div class="input-label">Instance Nickname</div>
                    <input class="input input-placeholder" placeholder="Nickname" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" float v-model="server.nickname"></input>
                </v-ons-row>
                <v-ons-row class="app-details">
                    <div class="input-label">User Name</div>
                    <input class="input input-placeholder" placeholder="Username" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" float v-model="server.username"></input>
                </v-ons-row>
                <v-ons-row class="app-details">
                    <div class="input-label">Password</div>
                    <input class="input input-placeholder" placeholder="Password" type="password" v-model="server.password"></input>
                </v-ons-row>

                <!-- App Buttons -->
                <v-ons-row class="app-button-row">
                    <!-- App save Button -->
                    <v-ons-button :disabled="disableSignIn" class="app-button relative app-save" v-on:click="login">
                        <div class="icon-circle"></div>
                        <v-ons-icon class="save-icon" icon="ion-checkmark-round"></v-ons-icon>
                        <span class="btn-text">Save</span>
                        <div class="btn-subtitle">Add this instance to your device</div>
                    </v-ons-button>

                    <!-- App Cancel Button -->
                    <v-ons-button class="app-button relative app-delete" v-on:click="cancel">
                        <div class="icon-circle"></div>
                        <v-ons-icon class="delete-icon" icon="ion-trash-a"></v-ons-icon>
                        <span class="btn-text">Cancel</span>
                        <div class="btn-subtitle">Discard this instance</div>
                    </v-ons-button>
                </v-ons-row>
            </div>
        </v-ons-page>
    </page-header-layout>
</template>

<script>

export default {
    name: 'ServerManager',
    data() {
        return {
            server: {
                url: '',
                nickname: '',
                username: '',
                password: '',
                token: '',
                refresh_token: '',
                client_id: '',
                active_project: '',
                projects: {},
                user: {},
            },
            authenticating: false,
            error: false,
            error_message: '',
            default_error_message: 'Network response was not ok.'
        };
    },
    computed: {
        disableSignIn: function() {
            return !this.server.url || !this.server.nickname || !this.server.username || !this.server.password;
        }
    },
    methods: {
        cancel: function() {
            this.$router.back();
        },
        login: function() {
            var self = this;
            self.authenticating = true;
            this.$store.dispatch('getUserProfile', this.server)
            .then(function(response){
                if (response.ok) {
                    return response.json();
                } else {
                    if (response.status === 401) {
                        throw new Error('The supplied username or password was not valid.');
                    } else {
                        throw new Error(self.default_error_message);
                    }
                }
            })
            .then(function(response){
                self.server.user = response;
                return self.$store.dispatch('getClientId', self.server);
            })
            .then(function(response){
                if (response.ok) {
                    return response.json();
                } else {
                    if (response.status === 401) {
                        throw new Error('The supplied username or password was not valid.');
                    } else if (response.status === 500) {
                        throw new Error('The instance you are trying to access does not have a registered application. Contact Administrator.');
                    } else {
                        throw new Error(self.default_error_message);
                    }
                }
            })
            .then(function(response){
                self.server.client_id = response.clientid;
                return self.$store.dispatch('getToken', self.server);
            })
            .then(function(response){
                if (response.ok) {
                    return response.json();
                } else {
                    if (response.status === 401) {
                        throw new Error('Access Token denied. Contact Administrator to check ClientId or user access to project.');
                    } else {
                        throw new Error(self.default_error_message);
                    }
                }
            })
            .then(function(response) {
                self.server.token = response.access_token;
                self.server.refresh_token = response.refresh_token;
                self.$store.commit('addNewServer', self.server);
                return self.server;
            })
            .then(function(response) {
                return self.$store.dispatch('getRemoteProjects', {'server': self.$store.getters.activeServer});
            })
            .then(function(response) {
                self.authenticating = false;
                if (response) {
                    self.$router.push({'name': 'projectlist'});
                }
            })
            .catch(function(error) {
                self.authenticating = false;
                self.handleAlert(error.message);
            });
        },
        handleAlert: function(errorMessage) {
            this.$store.commit('handleAlert', errorMessage);
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.form-header {
  background: #A10408;
  color: #fff;
  padding: 10px 0px;
}

.app-input-panel {
    background: #A8EEE9;
}

.left-button-text {
    padding-left: 15px;
    font-size: 19px;
}

.input {
    background-color: #fff;
    padding-left: 10px;
    margin: 10px 0;
}

.app-button-row {
    justify-content: space-evenly;
}

.app-button-col {
    padding: 10px;
}

.app-details {
    padding: 15px;
    background: #fafafa;
    border-top: 1px solid #ddd;
}

.input-label {
    font-size: 15px;
    font-weight: 400;
    color: #271F4C;
    padding-right: 5px;
}

.input-placeholder {
    font-size: 14px;
    font-weight: 400;
    color: #777;
}

.relative {
    position: relative;
}

.app-button {
    float: right;
    height: 60px;
    color: #2E9C94;
    font-weight: 500;
    text-transform: capitalize;
    text-align: left;
    padding: 10px 20px;
    /* background: #DEFBF9; */
    background: #fff;
    border-top: 1px solid #78D9D2;
    border-radius: 0px;
    box-shadow: none;
    width: 100%;
}

.app-button:last-child {
    border-bottom: 1px solid #78D9D2;
}

.btn-text {
    position: absolute;
    font-size: 15px;
    top: 6px;;
    left: 70px;
}

.btn-subtitle {
    position: absolute;
    font-size: 13px;
    font-weight: 400;
    color: #aaa;
    top: 23px;
    left: 70px;
}

.save-icon {
    position: absolute;
    top: 17px;
    left: 30px;
}

.icon-circle {
    box-sizing: border-box;
    border: solid 1px #78D9D2;
    border-radius: 50%;
    height: 40px;
    width: 40px;
    background: #A8EEE9;
}

.delete-icon {
    position: absolute;
    top: 17px;
    left: 32px;
    color: #970B00;
}

.app-delete .icon-circle {
    border: solid 1px #f22314;
    background: #FF796F;
}

.error-panel {
    min-height: 50px;
    padding: 10px;
    background: #f1f1f1;
    color: #454545;
}

.error-text {
    font-size: 14px;
    color: #777;
}

</style>
