export default {
    data() {
        return {
            project: this.$store.getters.activeProject,
            allCards: this.$store.getters.activeGraph.cards,
            allWidgets: this.$store.getters.activeGraph.widgets,
            allTiles: this.$store.getters.tiles,
            allNodegroups: this.$store.getters.activeGraph.nodegroups
        };
    },
    methods: {
        cardFactory: function(nodegroup, tile) {
            /*
             * Return an object that will support the card component in a report
             */
            var self = this;
            var card = this.allCards.find(function(card) { return card.nodegroup_id === nodegroup.nodegroupid; });
            var vm = this.$underscore.extend(card, {
                tile: tile,
                widgets: this.getCardWidgets(card),
                cards: []
            });
            var childNodegroups = this.getSubNodegroups(nodegroup);
            if (childNodegroups.length > 0) {
                childNodegroups.forEach(function(childnodegroup) {
                    vm.cards = self.getCards(childnodegroup, tile);
                });
            }
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
        getSubNodegroups(parent) {
            /*
             * Recursively collect the nodegroups, and their children that belong to a parent nodegroup
             * Assign the corresponding card to each nodegroup
             */
            return this.allNodegroups.filter(function(nodegroup) {
                return nodegroup.parentnodegroup_id === parent.nodegroupid;
            });
        },
        getCards(nodegroup, tile) {
            /*
             * Build an array of nodegroups with its card and child nodegroups
             */
            var self = this;
            var cards = [];
            var card;
            var tiles;
            if (tile) {
                tiles = this.resourceTiles.filter(function(t) {
                    return (t.nodegroup_id === nodegroup.nodegroupid && t.parenttile_id === tile.tileid);
                });
            } else {
                tiles = this.resourceTiles.filter(function(t) {
                    return (t.nodegroup_id === nodegroup.nodegroupid);
                });
            }
            if (tiles.length) {
                tiles.forEach(function(tile) {
                    card = self.cardFactory(nodegroup, tile);
                    var c = JSON.stringify(card);
                    cards.push(JSON.parse(c));
                });
            } else {
                cards.push(self.cardFactory(nodegroup, null));
            }
            return cards;
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
        resourceTiles: {
            get: function() {
                if (!!this.resourceid) {
                    return this.$underscore.filter(this.$store.getters.tiles, function(tile) {
                        return tile.resourceinstance_id === this.resourceid;
                    }, this);
                } else {
                    return [];
                }
            }
        },
        cardTree: {
            get: function() {
                /*
                 * Build an array of nodegroups with its card and child nodegroups
                 */
                var rootNodegroups = this.allNodegroups.filter(function(nodegroup) {
                    return nodegroup.parentnodegroup_id === null;
                });
                var tree = {
                    cards: []
                };
                var self = this;
                rootNodegroups.forEach(function(nodegroup) {
                    if (self.projectNodegroupIds.indexOf(nodegroup.nodegroupid) > -1) {
                        tree.cards.push(self.getCards(nodegroup));
                    }
                });
                return tree;
            }
        }
    }
};
