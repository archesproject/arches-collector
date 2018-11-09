<template>
    <v-ons-page>
      <div v-for="card in topCards">
          <card :card="card" class="report-content"></card>
      </div>
    </v-ons-page>
</template>

<script>
export default {
    name: 'ResourceReportPage',
    props: [],
    data() {
        return {
            project: this.$store.getters.activeProject,
            resourceid: this.$store.getters.activeServer.active_resource,
            allCards: this.$store.getters.activeGraph.cards,
            allWidgets: this.$store.getters.activeGraph.widgets,
            allNodegroups: this.$store.getters.activeGraph.nodegroups,
            user: this.$store.getters.activeServer.user,
            allTiles: this.$store.getters.tiles
        };
    },
    computed: {
        topCards: {
            get: function() {
                var self = this;
                var vms = this.$underscore.filter(this.allCards, function(card) {
                    return self.project.cards.indexOf(card.cardid) > 0;
                }).map(function(projectcard) {
                    return self.cardFactory(projectcard);
                });
                console.log('vms', vms);
                return vms;
            }
        }
    },
    methods: {
        init: function() {
            console.log(this);
        },
        cardFactory: function(card) {
            var vm = {
                name: card.name,
                cardid: card.cardid,
                tiles: this.getCardTiles(card)
            };
            return vm;
        },
        getCardWidgets: function(card) {
            var widgets = this.allWidgets.filter(widget => widget.card_id === card.cardid);
            return widgets.sort(function(a, b) {
                return a.sortorder - b.sortorder;
            });
        },
        getCardTiles: function(card) {
            var self = this;
            var tiles = this.allTiles.filter(function(tile) {
                return (tile.nodegroup_id === card.nodegroup_id) && self.resourceid === tile.resourceinstance_id;
            });
            tiles.forEach(function(tile) {
                tile.widgets = self.getCardWidgets(card);
            });
            return tiles;
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
    border-bottom-style: solid 1px #ccc;
    padding: 5px;
}

</style>
