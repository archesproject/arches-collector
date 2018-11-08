<template>
    <div>
        <div>{{card.name}}</div>
        <div v-for="tile in card.tiles">
            <component v-for="widget in tile.widgets" :allNodes="allNodes" class="widget" :context="'report'" :tile="tile" :widget="widget" v-bind:is="'base-widget'"></component>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ResourceReportPage',
    props: ['card'],
    data() {
        return {
            project: this.$store.getters.activeProject,
            resourceid: this.$store.getters.activeServer.active_resource,
            allCards: this.$store.getters.activeGraph.cards,
            allWidgets: this.$store.getters.activeGraph.widgets,
            allNodes: this.$store.getters.activeGraph.nodes,
            allNodegroups: this.$store.getters.activeGraph.nodegroups,
            user: this.$store.getters.activeServer.user
        };
    },
    computed: {
        tiles: {
            get: function() {
                return this.$store.getters.tiles;
            }
        }
    },
    methods: {
        init: function() {
            console.log('card is', this.card);
        }
    },
    mounted() {
        this.init();
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.report-content {
    padding: 15px;
}

</style>
