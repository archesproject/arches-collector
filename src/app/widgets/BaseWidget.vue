<template>
    <component :value="value" v-bind:is="widgetComponent"></component>
</template>


<script>
export default {
    name: 'BaseWidget',
    props: ['allNodes', 'widget', 'tile'],
    data() {
        return {};
    },
    methods: {
    },
    computed: {
        widgetComponent: {
            get: function() {
                var node = this.$underscore.find(this.allNodes, function(node) {
                    return node.nodeid === this.widget.node_id;
                }, this);
                // console.log('in datatype function')
                // console.log(node.datatype)
                return node.datatype + '-widget';
            }
        },
        value: {
            get: function() {
                if (!!this.tile) {
                    //console.log(this.tile.data[this.widget.node_id]);
                    return this.tile.data[this.widget.node_id];
                }
            }
        }
    }
};
</script>

<style scoped>
</style>
