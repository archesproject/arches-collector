export default {
    data() {
        return {
            project: this.$store.getters.activeProject,
            allCards: this.$store.getters.activeGraph.cards,
            allWidgets: this.$store.getters.activeGraph.widgets,
            allNodegroups: this.$store.getters.activeGraph.nodegroups,
            allTiles: this.$store.getters.tiles
        };
    },
    methods: {
        cardFactory: function(card) {
            /*
             * Return an object that will support the card component in a report
             */
            var vm = {
                name: card.name,
                cardid: card.cardid,
                tiles: this.getCardTiles(card)
            };
            return vm;
        },
        getCardWidgets: function(card) {
            /*
             * Get the widgets that belong to a given card
             */
            var widgets = this.allWidgets.filter(widget => widget.card_id === card.cardid);
            return widgets.sort(function(a, b) {
                return a.sortorder - b.sortorder;
            });
        },
        getCardTiles: function(card) {
            /*
             * Get the tiles that belong to a card for the current resource instance
             * Get the corresponding widgets for each tile
             */
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
            /*
             * Recursively collect the nodegroups, and their children that belong to a parent nodegroup
             * Assign the corresponding card to each nodegroup
             */
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
                /*
                 * Get a list of nodegroupids that belong to the current project
                 */
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
                /*
                 * Build an array of nodegroups with its card and child nodegroups
                 */
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
