<template>
    <v-ons-page>
        <ul id="example-1">
          <li v-for="card in topCards">
              <card :card="card" class="report-content"></card>
          </li>
        </ul>
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
            user: this.$store.getters.activeServer.user
        };
    },
    computed: {
        topCards: {
            get: function() {
                var self = this;
                return this.$underscore.filter(this.allCards, function(card) {
                    if (self.project.cards.indexOf(card.cardid) > 0) {
                        return self.cardFactory(card)
                        }
                    })
            }
        },
    },
    methods: {
        init: function() {
            console.log(this);
        },
        cardFactory: function(card) {
            var vm = {
                name: card.name,
                cardid: card.cardid,
                cardwidgets: this.getCardWidgets(card)
            }
            return vm;
        },
        getCardWidgets: function(card) {
            var widgets = this.$underscore.filter(this.allWidgets, function(widget) {
                return widget.card_id === card.cardid;
            }, this);
            return this.$underscore.sortBy(widgets, 'sortorder');
        }
    },
    mounted() {
        this.init();
    },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.report-content {
    border-bottom-style: solid 1px #ccc;
    padding: 5px;
}

</style>
