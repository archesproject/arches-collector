<template>
    <v-ons-splitter>
        <v-ons-splitter-side
            swipeable width="300px" collapse="" side="left"
            :open.sync="openSide" class="toolbar-header">
            <v-ons-page>
                <v-ons-toolbar class="toolbar-header">
                    <div class="left">
                        <v-ons-toolbar-button class="left-button-text" @click="toggleOpen">
                            <v-ons-icon icon="ion-android-upload"></v-ons-icon>
                            <span class="left-button-text">Arches Applications</span>
                        </v-ons-toolbar-button>
                    </div>
                </v-ons-toolbar>
                <v-ons-list>
                    <v-ons-list-item tappable modifier="longdivider" v-for="(server, key) in servers" :key="server.url" @click="selectServer(server.url);">
                        <v-ons-icon icon="ion-android-checkbox-outline"></v-ons-icon>
                        <span style="padding-left: 10px;">
                            {{server.nickname}}<br>
                            <span style="font-size: 12px;">{{server.url}}</span>
                        </span>
                    </v-ons-list-item>
                    <v-ons-list-item tappable @click="goTo('servermanager');">
                        <v-ons-icon icon="ion-plus-circled"></v-ons-icon>
                        <span style="padding-left: 10px;">Add Application</span>
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
            return this.$store.state.dbs.app_servers.servers;
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
    background-color: #503838 !important;
}

</style>
