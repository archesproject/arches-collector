<template>
    <component :value.sync="value" :context.sync="context" v-bind:is="widgetComponent" :tile="tile" :tiles="tiles" :widget="widget" :node="node"></component>
</template>


<script>
export default {
    name: 'BaseWidget',
    props: ['allNodes', 'widget', 'save', 'tile', 'tiles', 'context'],
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
                value: !!this.tile ? JSON.parse(JSON.stringify(this.tile.data)) : undefined
            };
        }
    },
    computed: {
        widgetComponent: {
            get: function() {
                return this.node.datatype + '-widget';
            }
        },
        node: {
            get: function() {
                var node = this.$underscore.find(this.allNodes, function(node) {
                    return node.nodeid === this.widget.node_id;
                }, this);
                return node;
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
                        provisionaledit = this.tile.provisionaledits[this.user.id]['value'];
                        if (this.widget.config.defaultValue) {
                            provisionaledit[this.widget.node_id] = this.widget.config.defaultValue;
                        }
                    }
                    if (provisionaledit.hasOwnProperty(this.widget.node_id)) {
                        return provisionaledit[this.widget.node_id];
                    }
                    return '';
                    throw new Error('');
                } catch (err) {
                    // console.log('node id');
                    // console.log(this.widget.node_id);
                    return ' ';
                }
                // if (!!this.tile && !!this.tile.data) {
                //     //console.log(this.tile.data[this.widget.node_id]);
                //     return this.tile.data[this.widget.node_id];
                // }else{
                //     return '';
                // }
            },
            set: function(newValue) {
                this.tile.provisionaledits[this.user.id]['value'][this.widget.node_id] = newValue;
                this.tile.provisionaledits[this.user.id]['timestamp'] = new Date().toJSON();
                this.save();
            }
        }
    }
};
</script>

<style src="semantic-ui-css/semantic.css"></style>

<style scoped>

</style>
