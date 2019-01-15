<template>
    <page-header-layout>
        <v-ons-page>
            <!-- <v-ons-toolbar class="toolbar-header">
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
            </v-ons-toolbar> -->
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
    </page-header-layout>
</template>

<script>
export default {
    name: 'ServerListPage',
    //props: ['active-server'],
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
            .then(function(response) {
                self.selectedServer.token = response.access_token;
                self.selectedServer.refresh_token = response.refresh_token;
                return self.$store.dispatch('updateToken', self.selectedServer);
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

    .inactive_project{
        background-color: #f3f3f3;
    }

    .projects-header {
        color: #645F87;
        background: #f4f4f4;
        border-bottom: 1px solid #ddd;
    }

    .projects-title {
        font-size: 17px;
        font-weight: 500;
    }

    .project-name {
        color: #454545;
        font-size: 14px;
    }

    .project-name.deleted {
        color: #454545;
        font-size: 14px;
        padding-left: 5px;
    }

    .project-active {
        color: #777;
        font-size: 12px;
        padding-left: 0px;
    }

    .project-inactive {
        color: #777;
        font-size: 13px;
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

    .menu-subtext {
        font-size: 12px;
    }

    .list-item {
        border-bottom: 1px solid #eee;
    }

</style>
