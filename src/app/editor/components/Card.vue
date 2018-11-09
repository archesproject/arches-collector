<template>
    <div>
        <div class="card-container"><span class="card-label">{{card.name}}</span>
        <div class="card-container" v-for="tile in card.tiles">
            <component v-for="widget in tile.widgets" :allNodes="allNodes" class="widget" :context="'report'" :tile="tile" :widget="widget" v-bind:is="'base-widget'"></component>
        </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ResourceReportPage',
    props: ['card'],
    data() {
        return {
            allNodes: this.$store.getters.activeGraph.nodes,
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

.card-container {
    font-size: 0.95em;
    padding-left: 10px;
    padding-bottom: 5px;
    padding-top: 5px;
    background-color: white;
}

.card-label {
    font-weight: 600;
    color: #555;
}


</style>
