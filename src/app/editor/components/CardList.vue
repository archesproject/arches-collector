<template>
    <div>
        <!-- Scrollable content here -->
        <ons-scroll>
            <v-ons-list>
                <v-ons-list-item tappable modifier="longdivider" v-for="card in cards" :key="card.resourceinstanceid" @click="navigate_subcard(card)">
                    <span style="width: 90%">
                       {{card.name}}
                    </span>
                    <span v-if="has_sub_card(card)">
                        >
                    </span>
                    <span v-if="has_tiles(card)">
                        +
                    </span>
                </v-ons-list-item>
            </v-ons-list>
        </ons-scroll>
    </div>
</template>
<script>
export default {
    name: 'CardList',
    props: ['nodegroupid', 'cards', 'allnodegroups', 'tiles', 'resourceid'],
    data() {
        return {
            // cards: this.$store.getters.activeGraph.cards
        };
    },
    computed: {
        // cards: function(){
        //     var allcards = this.project.graph.cards;
        //     // ko.observableArray(_.filter(data.cards, function(card) {
        //     //     var nodegroup = _.find(ko.unwrap(params.graphModel.get('nodegroups')), function(group) {
        //     //         return ko.unwrap(group.nodegroupid) === card.nodegroup_id;
        //     //     });
        //     //     return !nodegroup || !ko.unwrap(nodegroup.parentnodegroup_id);
        //     // })
        //     return allcards;
        // }
    },
    mounted() {
    },
    methods: {
        navigate_subcard: function(card){
            console.log(card)
            this.$emit('update_nodegroupid', card.nodegroup_id);
            //this.nodegroupid = card.nodegroup_id;
            // this.$router.push({
            //     'name': 'resource',
            //     params: {
            //         'nodegroupid': card.nodegroup_id
            //     }
            // });
        },
        has_sub_card: function(card){
            var found = this.$underscore.find(this.allnodegroups, function(nodegroup) {
                return nodegroup.parentnodegroup_id === card.nodegroup_id;
            }, this);
            console.log(found);
            return !!found;
        },
        has_tiles: function(card) {
            var tiles = this.$underscore.filter(this.$store.getters.getTiles, function(tile) {
                return tile.resourceinstance_id === this.resourceid && tile.nodegroup_id === card.nodegroup_id;
            }, this);
            return tiles.length > 0;
        },
    }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.resource-model-name {
    padding-top: 10px;
    display: flex;
    flex-direction: row;
}

.resource-model-title {
    display: flex;
    flex-direction: column;
    padding-left: 5px;
}

.resource-model-subtitle {
    font-size: 12px;
    padding-top: 2px;
}

.icon-circle {
    border: solid 1px #aec3f4;
    padding: 10px;
    border-radius: 50%;
    height: 18px;
    width: 18px;
    background: #d7e0f8;
}
</style>