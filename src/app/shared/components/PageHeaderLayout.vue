<template>
    <v-ons-splitter>
        <v-ons-splitter-side style=""
            swipeable width="300px" collapse="" side="left"
            :open.sync="openSide" class="toolbar-header">
            <v-ons-page>
                <v-ons-toolbar class="toolbar-header">
                    <div class="left">
                        <v-ons-toolbar-button class="left-button-text" @click="toggleOpen">
                            <div v-if="!statusServer">
                                <v-ons-icon class="toolbar-header-icon" icon="fa-question-circle" @click="setStatusServerUrl($event, false)"></v-ons-icon>
                                <span class="left-button-text toolbar-header-title">Arches Applications</span>
                            </div>
                            <div v-if="statusServer">
                                <v-ons-icon class="toolbar-header-icon"icon="ion-android-arrow-dropleft-circle" @click="setStatusServerUrl($event, false)"></v-ons-icon>
                                <span class="left-button-text toolbar-header-title">{{statusServer.nickname}}</span>
                            </div>
                        </v-ons-toolbar-button>
                    </div>
                </v-ons-toolbar>
                <div v-show="statusServer === undefined || statusServer === false" class="app-page-color">
                    <v-ons-list class="application-list">
                        <v-ons-list-item class="application-item-panel" tappable modifier="longdivider" v-for="(server, key) in servers" :key="server.url" @click="selectServer(server.url);">
                            <span class="application-list-item-prepanel">
                                <v-ons-icon class="application-list-item-icon" icon="ion-checkmark-round"></v-ons-icon>
                            </span>
                            <span class="application-list-item">
                                {{server.nickname}}<br>
                                <span class="application-list-item-url">{{server.url}}</span>
                            </span>
                            <span class="right">
                                <v-ons-icon class="add-application-icon" v-if="statusServer !== server" icon="fa-info-circle" @click="setStatusServerUrl($event, server);"></v-ons-icon>
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
                <div class="app-page-color" v-show="statusServer">
                    <v-ons-row class="app-button-row">
                        <v-ons-col class="app-details">
                            <span>Arches Application</span>
                            <span v-if="statusServer !== undefined">
                                <div class="server-url">{{statusServer.url}}</div>
                            </span>
                        </v-ons-col>
                    </v-ons-row>
                    <v-ons-row class="app-button-row">
                    <v-ons-column>
                        <v-ons-row>
                            <v-ons-col class="app-button-col"><v-ons-button class="left success" @click="$ons.notification.confirm('Are you sure you want to logout?')">Logout</v-ons-button></v-ons-col>
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
            statusServerUrl: undefined
        };
    },
    computed: {
        servers() {
            return this.$store.getters.servers;
        },
        statusServer: function() {
            return this.statusServerUrl;
        }
    },
    methods: {
        toggleOpen: function() {
            this.openSide = !this.openSide;
        },
        goTo: function(name) {
            this.$router.push({'name': name});
        },
        selectServer: function(serverurl, e) {
            this.$store.commit('setActiveServer', serverurl);
            this.openSide = false;
            this.goTo('projectlist');
        },
        setStatusServerUrl: function(e, serverurl) {
            e.stopPropagation();
            this.statusServerUrl = serverurl;
        },
        deleteServer: function(answer) {
            if (answer === 1) {
                this.$store.commit('deleteServer', this.statusServerUrl.url);
            } else {
                console.log('not deleting')
            }
        }
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

.toolbar-header {
    background-color: #413040;
}

.toolbar-header-title {
    vertical-align: middle;
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
