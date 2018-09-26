<template>
    <div>
        <!-- Scrollable content here -->
        <ons-scroll>
            <v-ons-list>
                <v-ons-list-item tappable modifier="longdivider" v-for="card in cards" :key="card.resourceinstanceid">
                    <span>
                       {{card.name}}
                    </span>
                </v-ons-list-item>
            </v-ons-list>
        </ons-scroll>
    </div>
</template>
<script>
export default {
    name: 'CardList',
    props: ['nodegroup', 'cards'],
    data() {
        return {
            //cards: this.$store.getters.activeGraph.cards
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