<template>
    <v-ons-splitter>
        <v-ons-splitter-side style=""
            swipeable width="300px" collapse="" side="left"
            :open.sync="openSide" class="toolbar-header">
            <v-ons-page>
                <v-ons-toolbar class="toolbar-header">
                    <v-ons-toolbar-button class="left left-button-text" @click="toggleOpen">
                        <div v-if="!selectedServer">
                            <v-ons-icon class="toolbar-header-icon" icon="fa-question-circle" @click="setSelectedServer($event, false)"></v-ons-icon>
                            <span class="left-button-text">Arches Applications</span>
                        </div>
                        <div v-if="selectedServer">
                            <v-ons-icon class="toolbar-header-icon"icon="ion-android-arrow-dropleft-circle" @click="setSelectedServer($event, false)"></v-ons-icon>
                            <span class="left-button-text">{{selectedServer.nickname}}</span>
                        </div>
                    </v-ons-toolbar-button>
                </v-ons-toolbar>
                <div v-show="selectedServer === undefined || selectedServer === false" class="app-page-color">
                    <v-ons-list class="application-list">
                        <v-ons-list-item class="application-item-panel" tappable modifier="longdivider" v-for="(server, key) in servers" :key="server.url" @click="setActiveServer(server.url);">
                            <span class="application-list-item-prepanel">
                                <v-ons-icon class="application-list-item-icon" icon="ion-checkmark-round"></v-ons-icon>
                            </span>
                            <span class="application-list-item">
                                {{server.nickname}}<br>
                                <span class="application-list-item-url">{{server.url}}</span>
                            </span>
                            <span class="right">
                                <v-ons-icon class="add-application-icon" v-if="selectedServer !== server" icon="fa-info-circle" @click="setSelectedServer($event, server);"></v-ons-icon>
                            </span>
                        </v-ons-list-item>
                        <v-ons-list-item class="application-item-panel" tappable @click="goTo('servermanager');">
                            <span class="application-list-item-prepanel">
                                <v-ons-icon class="add-application-icon" icon="ion-plus-round"></v-ons-icon>
                            </span>
                            <span class="application-list-item">Add Application</span>
                        </v-ons-list-item>
                    </v-ons-list>
                </div>
                <div class="app-page-color" v-show="selectedServer">
                    <v-ons-row class="app-details">
                        <v-ons-col>
                            <span>Arches Application</span>
                            <span v-if="selectedServer !== undefined">
                                <div class="server-url">{{selectedServer.url}}</div>
                            </span>
                        </v-ons-col>
                    </v-ons-row>
                    <v-ons-row class="app-details" v-if="selectedServer !== undefined">
                        <div>
                            <div class="server-url">Application Nickname</div>
                        </div>
                        <input class="input" v-model="selectedServer.nickname">
                        </input>
                    </v-ons-row>
                    <v-ons-row class="app-details" v-if="selectedServer !== undefined">
                        <div>
                            <div class="server-url">Username</div>
                        </div>
                        <input class="input" v-model="selectedServer.username">
                        </input>
                    </v-ons-row>
                    <v-ons-row class="app-details" v-if="selectedServer !== undefined">
                        <div>
                            <div class="server-url">Password</div>
                        </div>
                        <input class="input" type="password" v-model="selectedServer.password">
                        </input>
                    </v-ons-row>
                    <v-ons-row v-if="error">
                        <div class="left">
                            <v-ons-icon icon="exclamation-triangle" class="list-item__icon" style="color:#ea8a0b;"></v-ons-icon>
                        </div>
                        <div class="center">{{error_message}}</div>
                    </v-ons-row>
                    <v-ons-row class="app-button-row">
                        <v-ons-column>
                            <v-ons-row>
                                <v-ons-col class="app-button-col"><v-ons-button class="left success" @click="login">Save</v-ons-button></v-ons-col>
                                <v-ons-col class="app-button-col"><v-ons-button class="right danger" @click="$ons.notification.confirm({message: 'Are you sure you want to delete this App? All unsynched data will be lost.', callback: deleteServer})">Delete App</v-ons-button></v-ons-col>
                            </v-ons-row>
                        </v-ons-column>
                    </v-ons-row>

                </div>
                </v-ons-page>
        </v-ons-splitter-side>

        <v-ons-splitter-content>
            <v-ons-page>
                <page-header v-on:toggle-open-evt="toggleOpen"></page-header>
                <slot></slot>
            </v-ons-page>
        </v-ons-splitter-content>
    </v-ons-splitter>
</template>

<script>
export default {
    name: 'PageHeaderLayout',
    props: ['active-server'],
    data() {
        return {
            openSide: false,
            selectedServer: undefined,
            error: false,
            error_message: '',
            default_error_message: 'Oops, something happened, maybe you\re offline?'
        };
    },
    computed: {
        servers() {
            return this.$store.getters.servers;
        }
    },
    methods: {
        toggleOpen: function() {
            this.openSide = !this.openSide;
        },
        goTo: function(name) {
            this.$router.push({'name': name});
        },
        setActiveServer: function(serverurl, e) {
            this.$store.commit('setActiveServer', serverurl);
            this.openSide = false;
            this.goTo('projectlist');
        },
        setSelectedServer: function(e, serverurl) {
            e.stopPropagation();
            this.selectedServer = serverurl;
        },
        deleteServer: function(answer) {
            if (answer === 1) {
                this.$store.commit('deleteServer', this.selectedServer.url);
                this.selectedServer = false;
            } else {
                console.log('not deleting');
            }
        },
        login: function() {
            var self = this;
            this.error = false;
            this.$store.dispatch('getClientId', this.selectedServer)
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
                self.selectedServer.client_id = response.clientid;
                self.selectedServer.user = response.user;
                return self.$store.dispatch('getToken', self.selectedServer);
            })
            .then(function(response){
                if (response.ok) {
                    var responseJson = response.json();
                    self.selectedServer.token = responseJson.access_token;
                    self.selectedServer.refresh_token = responseJson.refresh_token;
                    return self.$store.dispatch('updateToken', self.selectedServer);
                } else {
                    if (response.status === 401) {
                        self.error_message = 'The supplied username or password was not valid.';
                    } else {
                        self.error_message = self.default_error_message;
                    }
                }

                throw new Error('Network response was not ok.');
            })
            .then(function(response) {
                return self.$store.dispatch('getRemoteProjects', self.$store.getters.activeServer);
            })
            .then(function() {
                self.selectedServer = false;
            })
            .catch(function(error) {
                // console.log('Error:', error);
                self.error = true;
            });
        },
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.list-item .ons-icon {
    font-size: 30px;
}

.left-button-text{
    color: white;
}

.input {
    background-color: whitesmoke;
    padding-left: 10px;
    margin: 10px 0;
}

.toolbar-header {
    background-color: #413040;
    align-items: center;
}


.toolbar-header-icon {
    vertical-align: middle;
}

.application-list {
    background: #4E394C;
    color: #fff;
}

.application-item-panel {
    border-bottom: 1px solid #413040;
}

.application-list-item {
    color: #fff;
    font-size: 15px;
    padding-left: 10px;
}

.application-list-item-prepanel {
    background: #392B39;
    height: 36px;
    width: 36px;
}

.application-list-item-icon {
    padding-top: 6px;
    padding-left: 8px;
    color: #A0B193;
}

.application-list-item-url {
    font-size: 12px;
    color: #aaa;
}

.add-application-icon {
    padding-top: 6px;
    padding-left: 8px;
    color: #fff;
}

.app-details {
    padding: 15px;
}

.app-page-color {
    color: #fff;
    background-color: #4E394C;
    height: 100%;
}

.app-details .server-url {
    color: #ccc;
    font-size: 15px;
}

.app-button-row {
    justify-content: space-evenly;
}

.app-button-col {
    padding: 10px;
}

</style>
