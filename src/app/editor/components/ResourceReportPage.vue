<template>
    <v-ons-page>
      <div v-for="cardtile in cardTree.cards" v-if="canView(cardtile)">
          <card :card="cardtile" class="report-content" :tiles="tiles" :activeindex="activeindex" v-on:switch-tabs="updateActiveIndex"></card>
     </div>
    </v-ons-page>
</template>

<script>
import cardtreemixin from '../mixins/card-tree';

export default {
    name: 'ResourceReportPage',
    props: ['activeindex', 'resourceid', 'tiles'],
    mixins: [cardtreemixin],
    data() {
        return {
            user: this.$store.getters.activeServer.user
        };
    },
    methods: {
        updateActiveIndex: function(event) {
            this.$emit('switch-tabs', 1);
        },
        canView: function(card) {
            return (!!card ? this.user.viewable_nodegroups.includes(card.nodegroup_id) : false);
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.report-content {
    border-bottom-style: solid 1px #ccc;
    padding: 5px;
    margin-bottom: -5px;
}

</style>
