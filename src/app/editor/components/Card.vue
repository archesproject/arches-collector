<template>
    <div>
        <div>{{card.name}}</div>
        <component v-for="widget in card.cardWidgets" class="widget" v-bind:is="'base-widget'"></component>
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
            console.log('card is', this);
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
