<template>
    <component :value.sync="value" v-bind:is="widgetComponent" :widget="widget"></component>
</template>


<script>
export default {
    name: 'BaseWidget',
    props: ['allNodes', 'widget', 'save', 'tile'],
    data() {
        return {
            waiting: false,
            project: this.$store.getters.activeProject
        };
    },
    methods: {},
    computed: {
        widgetComponent: {
            get: function() {
                var node = this.$underscore.find(this.allNodes, function(node) {
                    return node.nodeid === this.widget.node_id;
                }, this);
                // console.log('in datatype function')
                console.log(node.datatype + '-widget');
                return node.datatype + '-widget';
            }
        },
        value: {
            get: function() {
                try {
                    if (!!this.tile.data[this.widget.node_id]) {
                        return this.tile.data[this.widget.node_id];
                    }
                    throw('');
                } catch (err) {
                    console.log('node id');
                    console.log(this.widget.node_id);
                    return '';
                }
                // if (!!this.tile && !!this.tile.data) {
                //     //console.log(this.tile.data[this.widget.node_id]);
                //     return this.tile.data[this.widget.node_id];
                // }else{
                //     return '';
                // }
            },
            set: function(newValue) {
                console.log('in set');
                console.log(newValue);
                this.tile.data[this.widget.node_id] = newValue;
                this.save();
            }
        }
    }
};
</script>

<style scoped>
</style>
