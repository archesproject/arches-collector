export default {
    data() {
        return {
            message: 'hello',
            project: this.$store.getters.activeProject
        };
    },
    methods: {
        sayhello() {
            console.log('hello');
        },
        hasChildCards(card) {
            if (!card) {
                card = this.card;
            }
            console.log(this.allNodegroups);
            var found = this.$underscore.find(this.allNodegroups, function(nodegroup) {
                return nodegroup.parentnodegroup_id === (!!card ? card.nodegroup_id : null);
            }, this);
            return !!found;
        },
        getChildNodegroups(parent) {
            parent.children = {};
            var self = this;
            this.allNodegroups.forEach(function(nodegroup) {
                if (nodegroup.parentnodegroup_id === parent.nodegroupid) {
                    parent['children'][nodegroup.nodegroupid] = nodegroup;
                    self.getChildNodegroups(nodegroup);
                }
            });
        },
        getNodegroupTree() {
            var tree = {};
            var self = this;
            this.allNodegroups.forEach(function(nodegroup) {
                if (nodegroup.parentnodegroup_id === null) {
                    tree[nodegroup.nodegroupid] = nodegroup
                    self.getChildNodegroups(nodegroup);
                }
            });
            return tree;
        }
    },
    computed: {
        projectnodegroups: {
            get: function() {
                var self = this;
                var tree = {};
                var nodegroupids = this.$underscore.chain(this.allCards)
                    .filter(function(card) {
                        return self.project.cards.indexOf(card.cardid) > -1;
                    })
                    .map(function(projcard) {
                        return projcard.nodegroup_id;
                    }).value();
                var nodegroups = this.allNodegroups.filter(nodegroup => this.$underscore.contains(nodegroupids, nodegroup.nodegroupid));
            }
        }
    }
};
