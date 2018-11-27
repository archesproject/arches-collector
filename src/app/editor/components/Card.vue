<template>
    <div>
        <div class="card-container"><span @doubletap="segueToEditor(card)" class="card-label">{{card.name}}</span>

        <!-- <div class="card-container" v-if="card.cards.length > 0" v-for="card in card.cards"> -->
            <vue-touch class="done-btn" @doubletap="segueToForm(card, card.tile)">
                <component v-for="widget in card.widgets" :allNodes="allNodes" class="widget" :context="'report'" :tile="card.tile" :widget="widget" v-bind:is="'base-widget'"></component>
            </vue-touch>
        <!-- </div> -->
        <div v-for="cardtile in card.cards">
            <card :card="cardtile" class="report-content" v-on:switch-tabs="updateActiveIndex"></card>
        </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Card',
    props: ['card'],
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
        segueToForm: function(card, tile) {
            this.$store.getters.activeServer.card_nav_stack.unshift({card: card, tile: tile, showForm: true, activeObject: 'tile', 'tabIndex': 1});
            this.$emit('switch-tabs', 1);
        },
        segueToEditor: function(nodegroup, tile) {
            this.$store.getters.activeServer.card_nav_stack.unshift({
                card: nodegroup.card,
                tile: tile,
                showForm: false,
                activeObject: 'card',
                tabIndex: 1
            });
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
