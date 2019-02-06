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
                'card': this.card,
                'tile': tile,
                'showForm': !!showForm,
                'activeObject': 'tile', 
                'editorTab': editorTab
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
        hasWidgetsAndSubCards: function(card) {
            return this.hasWidgets(card) && this.hasChildCards(card);
        },
        canView: function(card) {
            return (!!card ? this.user.viewable_nodegroups.includes(card.nodegroup_id) : false);
        },
        canEdit: function(card) {
            return (!!card ? this.user.editable_nodegroups.includes(card.nodegroup_id) : false);
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
        }
    }
}