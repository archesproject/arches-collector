<template>
    <div>
        <div class="card-container"><span class="card-label">{{card.name}}</span>

        <!-- <div class="card-container" v-if="card.cards.length > 0" v-for="card in card.cards"> -->
            <vue-touch class="done-btn" @doubletap="segueToForm(card)">
                <div class="report widget-value" style="padding-left:5px" v-if="card.tile === null">No data yet added</div>
                <div v-if="card.tile !== null">
                <component v-for="widget in card.widgets" :allNodes="allNodes" class="widget" :tiles="tiles" :context="'report'" :tile="card.tile" :widget="widget" v-bind:is="'base-widget'"></component>
                </div>
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
    props: ['card', 'tiles'],
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
        segueToForm: function(card) {
            if (card.tile !== null) {
                var dbtile = this.$store.getters.tiles.find(function(t){
                    return t.tileid === card.tile.tileid;
                });
                this.$store.getters.activeServer.card_nav_stack.unshift({
                    card: card,
                    tile: dbtile,
                    showForm: true,
                    activeObject: 'tile'
                });
                this.$emit('switch-tabs', 1);
            }
        },
        segueToEditor: function(nodegroup, tile) {
            // TODO This function is currently unused, but intended navigate
            // users to the card in the editor where they manage sub cards/tiles
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
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.card-container {
    font-size: 0.95em;
    padding-left: 10px;
    padding-bottom: 15px;
    padding-top: 5px;
    background-color: #fbfbfb;
    border: 1px solid #ddd;
}

.card-label {
  background: #fff;
  border-bottom: 1px solid #ddd;
  color: #007E75;
  font-weight: 600;
  display: inherit;
  margin-top: -5px;
  margin-left: -10px;
  margin-bottom: 5px;
  padding: 5px 0 5px 10px;
}

.card-container .card-container {
  margin-bottom: 10px;
  margin-right: 5px;
}

</style>
