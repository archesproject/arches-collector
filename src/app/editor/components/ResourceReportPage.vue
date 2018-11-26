<template>
    <v-ons-page>
      <div v-for="cardlist in cardTree.cards">
        <div v-for="cardtile in cardlist">
          <card :card="cardtile" class="report-content" :activeindex="activeindex" v-on:switch-tabs="updateActiveIndex"></card>
      </div>
     </div>
    </v-ons-page>
</template>

<script>
import cardtreemixin from '../mixins/card-tree';

export default {
    name: 'ResourceReportPage',
    props: ['activeindex'],
    mixins: [cardtreemixin],
    data() {
        return {
            resourceid: this.$store.getters.activeServer.active_resource,
            user: this.$store.getters.activeServer.user,
        };
    },
    methods: {
        updateActiveIndex: function(event) {
            this.$emit('switch-tabs', 1);
        }
    },
    watch: {
        activeindex: function(val, oldVal) {
            /*
             * Forces a re-render if the tile count has changed.
             * A better approach would be to find the change and update the
             * affected card.
             */
            if (val === 0) {
                if (this.$store.getters.tiles.length !== this.allTiles.length) {
                    this.allTiles = this.$store.getters.tiles;
                }
            }
        }
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
