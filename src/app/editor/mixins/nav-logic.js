export default {
    data() {
        return {
            allWidgets: this.$store.getters.activeGraph.widgets,
            allNodegroups: this.$store.getters.activeGraph.nodegroups
        };
    },
    computed: {
        resourceid: {
            get: function() {
                if (!!this.$store.getters.activeServer && this.$store.getters.activeServer.active_resource) {
                    return this.$store.getters.activeServer.active_resource.resourceinstanceid;
                } else {
                    return null;
                }
            }
        }
    },
    methods: {
        setTileContext: function(tile, showForm, editorTab) {
            if (showForm === undefined) {
                if (this.hasChildCards() && !this.hasWidgets()) {
                    showForm = false;
                } else {
                    showForm = true;
                }
            }
            if (tile === 'blank') {
                tile = this.getBlankTile(this.card, this.tile);
                if (!this.hasWidgets(this.card)) {
                    this.saveTile(tile);
                }
            }
            this.$store.getters.activeServer.card_nav_stack.unshift({
                card: this.card,
                tile: tile,
                showForm: !!showForm,
                activeObject: 'tile',
                editorTab: editorTab
            });
        },
        hasChildCards: function(card) {
            if (!card) {
                card = this.card;
            }
            var found = this.$underscore.find(this.allNodegroups, function(nodegroup) {
                return nodegroup.parentnodegroup_id === (!!card ? card.nodegroup_id : null);
            }, this);
            return !!found;
        },
        hasWidgets: function(card) {
            if (!!card) {
                var widgets = this.$underscore.filter(this.allWidgets, function(widget) {
                    return widget.card_id === card.cardid;
                }, this);
                return widgets.length > 0;
            }
            return false;
        },
        getCardinality: function(card) {
            var found = this.$underscore.find(this.allNodegroups, function(nodegroup) {
                return nodegroup.nodegroupid === card.nodegroup_id;
            }, this);
            if (!!found) {
                return found.cardinality;
            }
            return '1';
        },
        hasWidgetsAndSubCards: function(card) {
            return this.hasWidgets(card) && this.hasChildCards(card);
        },
        canView: function(card) {
            return (!!card ? this.user.viewable_nodegroups.includes(card.nodegroup_id) : false);
        },
        canEdit: function(card) {
            return (!!card ? this.user.editable_nodegroups.includes(card.nodegroup_id) : false);
        },
        canDeleteTile: function(tile) {
            if (!!tile) {
                return tile.tileid && tile.tileid in this.$store.getters.activeProject.newly_created_tiles;
            } else {
                return false;
            }
        },
        canDeleteTiles: function(tiles) {
            if (tiles.length === 0) {
                return false;
            }
            return tiles.every(function(tile) {
                return this.canDeleteTile(tile);
            }, this);
        },
        getBlankTile: function(card, parentTile) {
            return {
                data: {},
                nodegroup_id: card.nodegroup_id,
                parenttile_id: parentTile ? parentTile.tileid : null,
                provisionaledits: {},
                resourceinstance_id: this.resourceid,
                sortorder: 0,
                tileid: '',
                type: 'tile',
                _id: ''
            };
        },
        saveTile: function(tile) {
            console.log('saving...');
            console.log(tile);
            this.$emit('saving', true);
            var self = this;

            this.$store.dispatch('persistTile', tile)
                .then(function(savedTile) {
                    return savedTile;
                })
                .finally(function() {
                    console.log('tile save finished...');
                    window.setTimeout(function() {
                        self.$emit('saving', false);
                    }, 2000);
                });
        },
        deleteTiles: function(tile, e, callback) {
            // you can either pass a single tile, or an array of tiles
            console.log('in deleteTiles');
            console.log('tile: ', tile);
            var self = this;
            e.stopPropagation();
            this.$ons.notification.confirm({
                message: 'Delete this Data? This can\'t be undone.',
                callback: function(answer) {
                    if (!!answer) {
                        self.$store.dispatch('deleteTiles', tile)
                            .finally(function() {
                                console.log('tile delete finished...');
                                if (!!callback) {
                                    callback();
                                }
                            });
                    }
                }
            });
        }
    }
};
