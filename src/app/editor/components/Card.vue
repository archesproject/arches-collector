<template>
    <div>
        <div class="card-container">
            <span class="card-label">
                <span>{{card.name}}</span>
                <span v-if="canEdit(card) && parentHasData" @click="segueToForm(card)" class="fa5 fa-pencil-alt edit-card"></span>
            </span>
            <div>
                <div class="report widget-value" style="padding-left:5px" v-if="card.tile === null">No data yet added</div>
                <div v-if="card.tile !== null">
                    <component v-for="widget in card.widgets" :allNodes="allNodes" class="widget" :tiles="tiles" :context="'report'" :tile="card.tile" :widget="widget" v-bind:is="'base-widget'"></component>
                </div>
            </div>
            <div v-for="cardtile in card.cards" v-if="canView(cardtile)">
                <card :card="cardtile" class="report-content" v-on:switch-tabs="updateActiveIndex"></card>
            </div>
        </div>
    </div>
</template>

<script>
import navlogicmixin from '../mixins/nav-logic';

export default {
    name: 'Card',
    props: ['card', 'tiles'],
    mixins: [navlogicmixin],
    data() {
        return {
            allNodes: this.$store.getters.activeGraph.nodes,
            user: this.$store.getters.activeServer.user
        };
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
        parentHasData: function() {
            var parentCard = this.$parent.card;
            if (!parentCard) {
                return true;
            } else {
                console.log(this.$parent.card);
                return parentCard.tile !== null;
            }
        }
    },
    methods: {
        updateActiveIndex: function(event) {
            this.$emit('switch-tabs', 1);
        },
        saveTile: function(tile) {
            console.log('saving...');
            console.log(tile);
            this.$emit('saving', true);
            var self = this;

            this.$store.dispatch('persistTile', tile)
                .then(function(savedTile) {
                    return savedTile;
                })
                .finally(function() {
                    console.log('tile save finished...');
                    window.setTimeout(function() {
                        self.$emit('saving', false);
                    }, 2000);
                });
        },
        segueToForm: function(card) {
            var dbtile = 'blank';
            if (card.tile !== null) {
                dbtile = this.$store.getters.tiles.find(function(t){
                    return t.tileid === card.tile.tileid;
                });
            }

            // we set this.tile so that if we have to create a blank tile
            // we have a proper parent tile id  (see getBlankTile)
            var parentCard = this.$parent.card;
            if (parentCard) {
                this.tile = parentCard.tile;
            }

            this.setTileContext(dbtile, undefined, 0);
            // remove all of the stack except the last item and set the
            // editorTab value to take us back to the report
            this.$store.getters.activeServer.card_nav_stack = [
                this.$store.getters.activeServer.card_nav_stack[0]
            ]
            this.$emit('switch-tabs', 1);
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

.edit-card {
    float: right;
    padding-right: 18px;
    color: #868686;
}

</style>
