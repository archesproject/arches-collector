export default {
    data() {
        return {
            project: this.$store.getters.activeProject,
            allCards: this.$store.getters.activeGraph.cards
        };
    },
    methods: {
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
        },
        getChildNodegroups(parent, cards) {
            parent.children = {};
            var self = this;
            if (!cards) {
                cards = this.allCards;
            }
            this.allNodegroups.forEach(function(nodegroup) {
                if (nodegroup.parentnodegroup_id === parent.nodegroupid) {
                    var nodegroupCard = cards.find(function(card) {
                        return card.nodegroup_id === nodegroup.nodegroupid;
                    });
                    nodegroup.card = self.cardFactory(nodegroupCard);
                    parent['children'][nodegroup.nodegroupid] = nodegroup;
                    self.getChildNodegroups(nodegroup);
                }
            });
        }
    },
    computed: {
        projectNodegroupIds: {
            get: function() {
                var self = this;
                return this.allCards.filter(function(card) {
                    return self.project.cards.indexOf(card.cardid) > -1;
                }).map(function(c) {
                    return c.nodegroup_id;
                });
            }
        },
        cardTree: {
            get: function() {
                var nodegroups = this.allNodegroups;
                var cards = this.allCards;
                var tree = {};
                var self = this;
                nodegroups.forEach(function(nodegroup) {
                    if (nodegroup.parentnodegroup_id === null && self.projectNodegroupIds.indexOf(nodegroup.nodegroupid) > -1) {
                        var nodegroupCard = cards.find(function(card) {
                            return card.nodegroup_id === nodegroup.nodegroupid;
                        });
                        nodegroup.card = self.cardFactory(nodegroupCard);
                        tree[nodegroup.nodegroupid] = nodegroup;
                        self.getChildNodegroups(nodegroup, cards);
                    }
                });
                return tree;
            }
        }
    }
};
