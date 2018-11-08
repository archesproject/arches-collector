<template>
    <div>
        <component v-for="widget in cardWidgets" class="widget" :allNodes="allNodes" :tile="tile" :widget="widget" :context="'editor'" :save="throttle(save, tile, saveDelay)" v-bind:is="'base-widget'"></component>
        <div class="done-btn"><v-ons-button @click="back"><v-ons-icon class="done-btn-icon resource-header" icon="ion-android-arrow-dropleft-circle"></v-ons-icon>Done</v-ons-button></div>
    </div>
</template>
<script>
export default {
    name: 'ResourceEditForm',
    props: ['formContext', 'card', 'tile', 'save', 'back'],
    data() {
        return {
            allWidgets: this.$store.getters.activeGraph.widgets,
            allNodes: this.$store.getters.activeGraph.nodes,
            project: this.$store.getters.activeProject,
            saveDelay: 800,
            timer: null,
            user: this.$store.getters.activeServer.user
        };
    },
    computed: {
        nodegroupid: {
            get: function() {
                return this.card.nodegroup_id;
            }
        },
        cardWidgets: {
            get: function() {
                if (!!this.card) {
                    var widgets = this.$underscore.filter(this.allWidgets, function(widget) {
                        return widget.card_id === this.card.cardid;
                    }, this);
                    return this.$underscore.sortBy(widgets, 'sortorder');
                } else {
                    return [];
                }
            }
        }
    },
    methods: {
        datatype: function(widget) {
            var node = this.$underscore.find(this.allNodes, function(node) {
                return node.nodeid === widget.node_id;
            }, this);
            // console.log('in datatype function')
            // console.log(node.datatype)
            return node.datatype;
        },
        throttle: function(fn, tile, delay) {
            var self = this;
            return function() {
                var context = this;
                clearTimeout(self.timer);
                self.timer = setTimeout(function() {
                    fn.call(context, tile);
                }, delay);
            };
        }
    }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.widget {
    padding: 15px;
}
.done-btn {
    float: right;
    padding: 10px;
}
.done-btn-icon {
    padding-right: 7px;
}
</style>
