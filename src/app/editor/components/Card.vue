<template>
    <div>
        <div class="card-container"><span class="card-label">{{nodegroup.card.name}}</span>
        <div class="card-container" v-if="nodegroup.card.tiles.length > 0" v-for="tile in nodegroup.card.tiles">
            <vue-touch class="done-btn" @doubletap="toeditor(nodegroup.card, tile)">
                <component v-for="widget in tile.widgets" :allNodes="allNodes" class="widget" :context="'report'" :tile="tile" :widget="widget" v-bind:is="'base-widget'"></component>
            </vue-touch>
        </div>
        <div class="card-container" v-if="nodegroup.card.tiles.length == 0">
            <div>None</div>
        </div>
        <div v-for="nodegroup in nodegroup.children">
            <card :nodegroup="nodegroup" class="report-content" v-on:switch-tabs="updateActiveIndex"></card>
        </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Card',
    props: ['nodegroup'],
    data() {
        return {
            allNodes: this.$store.getters.activeGraph.nodes,
            user: this.$store.getters.activeServer.user
        };
    },
    methods: {
        updateActiveIndex: function(event) {
            this.$emit('switch-tabs', 1);
        },
        toeditor: function(card, tile) {
            this.$store.getters.activeServer.card_nav_stack.unshift({card: card, tile: tile, showForm: true, activeObject: 'tile', 'tabIndex': 1});
            this.$emit('switch-tabs', 1);
        }
    },
    computed: {
        tabIndex: {
            get: function() {
                return this.activeIndex;
            },
            set: function(val) {
                this.activeIndex = val;
            }
        },
        tiles: {
            get: function() {
                return this.$store.getters.tiles;
            }
        }
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
