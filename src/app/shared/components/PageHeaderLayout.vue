<template>
    <v-ons-splitter>
        <v-ons-splitter-side style=""
            swipeable width="300px" collapse="" side="left"
            :open.sync="openSide" class="toolbar-header">
            <v-ons-page>
                <v-ons-toolbar class="toolbar-header" style="height: 50px;">
                    <div class="left">
                        <v-ons-toolbar-button class="left-button-text" @click="toggleOpen">
                            <v-ons-icon class="toolbar-header-icon" v-if="!statusServer" icon="fa-question-circle" @click="setStatusServerUrl($event, false)"></v-ons-icon>
                            <v-ons-icon class="toolbar-header-icon" v-if="statusServer" icon="ion-android-arrow-dropleft-circle" @click="setStatusServerUrl($event, false)"></v-ons-icon>
                            <span class="left-button-text toolbar-header-title">Arches Applications</span>
                        </v-ons-toolbar-button>
                    </div>
                </v-ons-toolbar>
                <div v-show="statusServer === undefined || statusServer === false">
                    <v-ons-list class="application-list" style="margin-top: 5px;">
                        <v-ons-list-item class="application-item-panel" tappable modifier="longdivider" v-for="(server, key) in servers" :key="server.url" @click="selectServer(server.url);">
                            <span class="application-list-item-prepanel">
                                <v-ons-icon class="application-list-item-icon" icon="ion-checkmark-round"></v-ons-icon>
                            </span>
                            <span class="application-list-item">
                                {{server.nickname}}<br>
                                <span class="application-list-item-url">{{server.url}}</span>
                            </span>
                            <span class="right">
                                <v-ons-icon class="add-application-icon" v-if="statusServer !== server.url" icon="fa-info-circle" @click="setStatusServerUrl($event, server.url);"></v-ons-icon>
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
                <div class="application-list" style="margin-top: 5px;">
                    <div class="right">
                    </div>
                      <div style="text-align: center; margin-top: 30px;">
                        <p>
                          <ons-input id="username" modifier="underbar" placeholder="Username" float></ons-input>
                        </p>
                        <p>
                          <ons-input id="password" modifier="underbar" type="password" placeholder="Password" float></ons-input>
                        </p>
                        <p style="margin-top: 30px;">
                          <ons-button onclick="login()">Sign in</ons-button>
                        </p>
                      </div>
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
            console.log('returning', this.statusServerUrl)
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
    height: 100vh;
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

</style>
