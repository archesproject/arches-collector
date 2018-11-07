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
            project: this.$store.getters.activeProject,
            user: this.$store.getters.activeServer.user
        };
    },
    methods: {
        createNewProvisionalEdit: function() {
            return {
                action: 'create',
                reviewer: null,
                reviewtimestamp: null,
                status: 'review',
                timestamp: '',
                value: this.tiledata
            };
        }
    },
    computed: {
        tiledata: {
            get: function() {
                return !!this.tile ? this.tile.data : undefined;
            }
        },
        widgetComponent: {
            get: function() {
                var node = this.$underscore.find(this.allNodes, function(node) {
                    return node.nodeid === this.widget.node_id;
                }, this);
                // console.log('in datatype function')
                // console.log(node.datatype + '-widget');
                return node.datatype + '-widget';
            }
        },
        value: {
            get: function() {
                try {
                    var provisionaledit;
                    if (!this.tile.provisionaledits) {
                        this.tile.provisionaledits = {};
                    }
                    if (!!this.tile.provisionaledits[this.user.id]) {
                        provisionaledit = this.tile.provisionaledits[this.user.id]['value'];
                    } else {
                        this.tile.provisionaledits[this.user.id] = this.createNewProvisionalEdit();
                        provisionaledit = this.tile.provisionaledits[this.user.id]['value']
                        if (this.widget.config.defaultValue) {
                            provisionaledit[this.widget.node_id] = this.widget.config.defaultValue;
                        }
                    }
                    if (!!provisionaledit[this.widget.node_id]) {
                        return provisionaledit[this.widget.node_id];
                    }
                    throw('');
                } catch (err) {
                    // console.log('node id');
                    // console.log(this.widget.node_id);
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
                // console.log('in set');
                // console.log(newValue);
                this.tile.provisionaledits[this.user.id]['value'][this.widget.node_id] = newValue;
                this.tile.provisionaledits[this.user.id]['timestamp'] = new Date().toJSON();
                this.save();
            }
        }
    }
};
</script>

<style scoped>
</style>
