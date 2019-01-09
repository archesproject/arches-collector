export default {
    data() {
        return {
            project: this.$store.getters.activeProject,
            allCards: this.$store.getters.activeGraph.cards,
            allWidgets: this.$store.getters.activeGraph.widgets,
            allNodegroups: this.$store.getters.activeGraph.nodegroups
        };
    },
    methods: {
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
            vm.cards = self.getCards(childNodegroups, tile);
            return vm;
        },
        deepcopy(obj) {
            return JSON.parse(JSON.stringify(obj));
        },
        getCards(nodegroups, tile) {
            /*
             * Build an array of nodegroups with its card and child nodegroups
             */
            var cards = [];
            var self = this;
            nodegroups.forEach(function(nodegroup) {
                var card;
                var tiles;
                if (tile) {
                    tiles = self.resourceTiles.filter(function(t) {
                        return (t.nodegroup_id === nodegroup.nodegroupid && t.parenttile_id === tile.tileid);
                    });
                } else {
                    tiles = self.resourceTiles.filter(function(t) {
                        return (t.nodegroup_id === nodegroup.nodegroupid);
                    });
                }
                if (tiles.length) {
                    tiles.forEach(function(tile) {
                        card = self.cardFactory(nodegroup, tile);
                        cards.push(self.deepcopy(card));
                    });
                } else {
                    card = self.cardFactory(nodegroup, null);
                    cards.push(self.deepcopy(card));
                }
            });
            return cards;
        }
    },
    watch: {
        activeindex: function(val) {
            // Updating the resourceid triggers an update of this.resourceTiles
            // This in turn updates the tree with the new tile data
            if (this.resourceTiles.length === 0) {
                var resourceid = this.$store.getters.activeServer.active_resource;
                this.resourceid = resourceid;
            }
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
                var tree = {
                    cards: []
                };
                if (this.activeindex !== null) {
                    // TODO This if statement is here because activeindex is reactive,
                    // It forces a refresh of the card tree when the active tab is changed.
                    // It would be better if there was a different property repersenting tile state
                    // could be used to update a card.
                    var self = this;
                    var rootNodegroups = this.allNodegroups.filter(function(nodegroup) {
                        return nodegroup.parentnodegroup_id === null && self.projectNodegroupIds.indexOf(nodegroup.nodegroupid) > -1;
                    });
                    tree.cards = self.getCards(rootNodegroups);
                }
                return tree;
            }
        }
    }
};
