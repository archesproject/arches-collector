<template>
    <page-header-layout>
        <v-ons-page>
            <!-- <v-ons-toolbar class="toolbar-header">
                <v-ons-toolbar-button class="left left-button-text" @click="toggleOpen">
                    <div v-if="!selectedServer">
                        <v-ons-icon class="toolbar-header-icon" icon="fa-question-circle" @click="setSelectedServer($event, false)"></v-ons-icon>
                        <span class="left-button-text">Arches Instance</span>
                    </div>
                    <div v-if="selectedServer">
                        <v-ons-icon class="toolbar-header-icon"fa-arrow-alt-circle-left" @click="setSelectedServer($event, false)"></v-ons-icon>
                        <span class="left-button-text">{{selectedServer.nickname}}</span>
                    </div>
                </v-ons-toolbar-button>
            </v-ons-toolbar> -->

            <!-- Instance List -->
            <div v-show="selectedServer === undefined || selectedServer === false" class="app-page-color">
                <v-ons-list class="application-list">
                    <v-ons-list-item class="add-application-panel" tappable @click="goTo('servermanager');">
                        <span class="application-list-item-prepanel">
                            <v-ons-icon class="add-application-icon" icon="fa-plus-circle"></v-ons-icon>
                        </span>
                        <span class="application-list-item">Add Instance</span>
                    </v-ons-list-item>
                    <v-ons-list-item class="application-item-panel" tappable modifier="longdivider" v-for="(server, key) in servers" :key="server.url" @click="setActiveServer(server.url);">
                        <span class="application-app-item-prepanel">
                            <v-ons-icon class="application-list-item-icon" icon="fa-check"></v-ons-icon>
                        </span>
                        <span class="application-list-item">
                            {{server.nickname}}<br>
                            <span class="application-list-item-url">{{server.url}}</span>
                        </span>
                        <span class="manage-app-btn-panel" @click="setSelectedServer($event, server);">
                            <v-ons-icon class="manage-app-btn" style="font-size: 20px;" v-if="selectedServer !== server" icon="fa-info"></v-ons-icon>
                        </span>
                    </v-ons-list-item>
                </v-ons-list>
                <v-ons-row style="position: absolute; bottom: 0px; padding: 10px; color: #ccc">
                    <v-ons-col><v-ons-icon icon="fa-info-circle" @click="appInfoVisible = !appInfoVisible"></v-ons-icon></v-ons-col>
                </v-ons-row>
                <v-ons-toast :visible.sync="appInfoVisible" animation="ascend">
                  Arches Collector Version 0.3.0
                  <button @click="appInfoVisible = false">X</button>
                </v-ons-toast>
            </div>

            <!-- Manage Selected App -->
            <div class="app-page-color" v-show="selectedServer">
                <v-ons-progress-bar indeterminate v-if="authenticating"></v-ons-progress-bar>
                <v-ons-row class="app-url-panel">
                    <v-ons-col>
                        <span v-if="selectedServer !== undefined">
                            <div class="server-url">{{selectedServer.url}}</div>
                        </span>
                    </v-ons-col>
                </v-ons-row>
                <v-ons-row class="app-details" v-if="selectedServer !== undefined">
                    <div class="input-label">Instance Nickname</div>
                    <input class="input input-placeholder" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" v-model="selectedServer.nickname"></input>
                </v-ons-row>
                <v-ons-row class="app-details" v-if="selectedServer !== undefined">
                    <div class="input-label">Username</div>
                    <input class="input input-placeholder" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" v-model="selectedServer.username"></input>
                </v-ons-row>
                <v-ons-row class="app-details" v-if="selectedServer !== undefined">
                    <div class="input-label">Password</div>
                    <input class="input input-placeholder" type="password" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" v-model="selectedServer.password"></input>
                </v-ons-row>

                <!-- App Buttons -->
                <v-ons-row class="app-button-row">
                    <!-- App save Button -->
                    <v-ons-button class="app-button relative app-save" @click="login">
                        <div class="icon-circle"></div>
                        <v-ons-icon class="save-icon" icon="fa-check"></v-ons-icon>
                        <span class="btn-text">Save</span>
                        <div class="btn-subtitle">Add this instance to your device</div>
                    </v-ons-button>

                    <!-- Cancel Button -->
                    <v-ons-button class="app-button relative app-return" @click="cancel">
                        <div class="icon-circle"></div>
                        <v-ons-icon class="return-icon" icon="fa-arrow-left"></v-ons-icon>
                        <span class="btn-text">Cancel</span>
                        <div class="btn-subtitle">Return to the Instance listing page</div>
                    </v-ons-button>

                    <!-- App Delete Button -->
                    <v-ons-button class="app-button relative app-delete" @click="$ons.notification.confirm({message: 'Are you sure you want to delete this instance? All unsynced data will be lost.', callback: deleteServer})">
                        <div class="icon-circle"></div>
                        <v-ons-icon class="delete-icon" icon="fa-trash"></v-ons-icon>
                        <span class="btn-text">Delete Instance</span>
                        <div class="btn-subtitle">Remove this instance from your device</div>
                    </v-ons-button>
                </v-ons-row>
            </div>
        </v-ons-page>
    </page-header-layout>
</template>

<script>
export default {
    name: 'ServerListPage',
    // props: ['active-server'],
    data() {
        return {
            openSide: false,
            selectedServer: undefined,
            selectedServerCopy: undefined,
            error: false,
            authenticating: false,
            appInfoVisible: false
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
            this.$router.push({ name: name });
        },
        setActiveServer: function(serverurl, e) {
            this.$store.commit('setActiveServer', serverurl);
            this.openSide = false;
            this.goTo('projectlist');
        },
        setSelectedServer: function(e, serverurl) {
            e.stopPropagation();
            this.selectedServer = serverurl;
            this.selectedServerCopy = Object.assign({}, serverurl);
        },
        deleteServer: function(answer) {
            if (answer === 1) {
                this.$store.commit('deleteServer', this.selectedServer.url);
                this.selectedServer = false;
            } else {
                console.log('not deleting');
            }
        },
        cancel: function() {
            Object.assign(this.selectedServer, this.selectedServerCopy);
            this.selectedServer = false;
        },
        login: function() {
            var self = this;
            this.error = false;
            this.authenticating = true;
            this.$store.dispatch('loginUser', this.selectedServer)
                .then(function(response) {
                    return self.$store.dispatch('updateToken', self.selectedServer);
                })
                .then(function(response) {
                    return self.$store.dispatch('getRemoteProjects', { server: self.$store.getters.activeServer });
                })
                .then(function() {
                    self.selectedServer = false;
                })
                .finally(function(response) {
                    self.authenticating = false;
                })
                .catch(function(error) {
                    self.handleAlert(error.message);
                });
        },
        handleAlert: function(alertMessage) {
            this.$store.commit('handleAlert', alertMessage);
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.list-item .ons-icon {
    font-size: 22px;
}

.left-button-text{
    color: white;
}

.input {
    background-color: #fff;
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
    color: #fff;
}

.add-application-panel {
    background: #f6f6f6;
    border-top: 1px solid #ddd;
}

.application-item-panel {
    border-top: 1px solid #ddd;
}

.application-list-item {
    font-size: 15px;
    padding-left: 10px;
}

.application-list-item-prepanel {
    background: #392B39;
    border-radius: 50%;
    height: 36px;
    width: 36px;
}

.application-app-item-prepanel {
    background: #A8EEE9;
    border-radius: 50%;
    border: 1px solid #2E9C94;
    height: 36px;
    width: 36px;
}

.application-list-item-icon {
    padding-top: 6px;
    padding-left: 6px;
    color: #2E9C94;
}

.application-list-item-url {
    font-size: 12px;
    color: #aaa;
}

.add-application-icon {
    padding-top: 7px;
    padding-left: 7px;
    color: #fff;
}

.app-url-panel {
    background: #A8EEE9;
    height: 60px;
    padding: 17px 20px;
    border-top: 1px solid #78D9D2;
}

.app-details {
    padding: 15px;
    background: #fafafa;
    border-top: 1px solid #ddd;
}

.app-page-color {
    color: black;
    height: 100%;
}

.server-url {
    font-size: 20px;
    color: #005A53;
}

.app-button-row {
    justify-content: space-evenly;
}

.app-button-col {
    padding: 10px;
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

.manage-app-btn-panel {
    background: #eee;
    border: 1px solid #ddd;
    height: 32px;
    width: 32px;
    position: absolute;
    right: 10px;
    top: 15px;
    border-radius: 50%;
    bottom: 0px;
    padding: 1px;
}

.manage-app-btn {
    margin-top: 4px;
    margin-left: 12px;
    color: #777;
}

.list-item--material__center .manage-app-btn {
  margin-top: 5px;
  margin-left: 11px;
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
    top: 20px;
    left: 30px;
    font-size: 22px;
}

.return-icon {
    position: absolute;
    top: 20px;
    left: 31px;
    color: #9E7100;
    font-size: 20px;
}

.delete-icon {
    position: absolute;
    top: 20px;
    left: 32px;
    color: #970B00;
    font-size: 20px;
}

.icon-circle {
    box-sizing: border-box;
    border: solid 1px #78D9D2;
    border-radius: 50%;
    height: 40px;
    width: 40px;
    background: #A8EEE9;
}

.app-return .icon-circle {
    border: solid 1px #FFB906;
    background: #FFD466;
}

.app-delete .icon-circle {
    border: solid 1px #f22314;
    background: #FF796F;
}

</style>
