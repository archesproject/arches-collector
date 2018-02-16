<template>
    <v-ons-toolbar>      
        <div class="left">
            <v-ons-toolbar-button class="left-button-offset" @click="toggleOpen">
                <img src="../../../assets/img/favicon.png" width="20"></img>
                <span class="left-button-text">{{active_server_name}}</span>
            </v-ons-toolbar-button>
        </div>
        <div class="center"></div>
        <div class="right">
            <v-ons-toolbar-button>
                <v-ons-icon icon="search"></v-ons-icon>
            </v-ons-toolbar-button>
            <v-ons-toolbar-button>
                <v-ons-icon icon="ion-navicon, material:md-more-vert"></v-ons-icon>
            </v-ons-toolbar-button>
        </div>
    </v-ons-toolbar>
</template>

<script>
export default {
    name: 'PageHeader',
    computed: {
        active_server_name() {
            return this.$store.getters.activeServer ? this.$store.getters.activeServer.nickname : '';
        }
    },
    methods: {
        toggleOpen: function() {
            this.$emit('toggle-open-evt');
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.left-button-text{
    color: black;
    position: relative;
    top: -1px;
}

.left-button-offset{
    padding-top:2px;
}

</style>
