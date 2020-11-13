<template>
    <div style="height: 100%; display:flex; flex-direction: column;">
        <component v-for="widget in cardWidgets" :key="widget.id" class="widget" :allNodes="allNodes" :tile="tile" :tiles="tiles" :widget="widget" :context="'editor'" :save="throttle(saveTile, tile, saveDelay)" v-bind:is="'base-widget'"></component>
        
        <div class="button-container">
            <v-ons-button class="resource-edit-button" style="max-width:40%;" @click="back"><v-ons-icon class="btn-icon resource-header" icon="fa-arrow-alt-circle-left"></v-ons-icon>Done</v-ons-button>
            <v-ons-button class="resource-edit-button warning" v-show="allowDelete" @click="deleteTiles(tile, $event, back)"><v-ons-icon class="btn-icon resource-header" icon="fa-trash"></v-ons-icon>Delete this Record</v-ons-button>
        </div>
    </div>
</template>
<script>
import navlogicmixin from '../mixins/nav-logic';

export default {
    name: 'ResourceEditForm',
    props: ['formContext', 'card', 'tile', 'tiles', 'back'],
    mixins: [navlogicmixin],
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

                    console.log('!!!!!!', widgets)
                    return this.$underscore.sortBy(widgets, 'sortorder');
                } else {
                    return [];
                }
            }
        },
        allowDelete: {
            get: function() {
                if (this.tile) {
                    return this.canDeleteTile(this.tile) && !this.hasChildCards(this.tile);
                } else {
                    return false;
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
    padding: 10px;
    overflow: hidden;
    display: flex;
}
.button-container {
    display: flex;
    flex-direction:row-reverse;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    height: max-content;
}
.resource-edit-button {
    display: flex;
    flex: 1;
    justify-content: center;
    align-items: center;
    margin: 0 10px;
}
.btn-icon {
    padding-right: 7px;
}
</style>
