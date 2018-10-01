<template>
    <v-ons-splitter>
        <v-ons-splitter-side style=""
            swipeable width="300px" collapse="" side="left"
            :open.sync="openSide" class="toolbar-header">
            <v-ons-page>
                <v-ons-toolbar class="toolbar-header" style="height: 50px;">
                    <div class="left">
                        <v-ons-toolbar-button class="left-button-text" @click="toggleOpen">
                            <v-ons-icon class="toolbar-header-icon" icon="ion-android-upload"></v-ons-icon>
                            <span class="left-button-text toolbar-header-title">Arches Applications</span>
                        </v-ons-toolbar-button>
                    </div>
                </v-ons-toolbar>
                <v-ons-list class="application-list" style="margin-top: 5px;">
                    <v-ons-list-item class="application-item-panel" tappable modifier="longdivider" v-for="(server, key) in servers" :key="server.url" @click="selectServer(server.url);">
                        <span class="application-list-item-prepanel">
                            <v-ons-icon class="application-list-item-icon" icon="ion-checkmark-round"></v-ons-icon>
                        </span>
                        <span class="application-list-item">
                            {{server.nickname}}<br>
                            <span class="application-list-item-url">{{server.url}}</span>
                        </span>
                    </v-ons-list-item>
                    <v-ons-list-item class="application-item-panel" tappable @click="goTo('servermanager');">
                        <span class="application-list-item-prepanel">
                            <v-ons-icon class="add-application-icon" icon="ion-plus-round"></v-ons-icon>
                        </span>
                        <span class="application-list-item">Add Application</span>
                    </v-ons-list-item>
                </v-ons-list>
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
            openSide: false
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
        selectServer: function(serverurl) {
            this.$store.commit('setActiveServer', serverurl);
            this.openSide = false;
            this.goTo('projectlist');
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
    height: 40px;
    width: 40px;
}

.application-list-item-icon {
    padding-top: 8px;
    padding-left: 10px;
    color: #A0B193;
}

.application-list-item-url {
    font-size: 12px;
    color: #aaa;
}

.add-application-icon {
    padding-top: 8px;
    padding-left: 10px;
    color: #fff;
}

</style>
