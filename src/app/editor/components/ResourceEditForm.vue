<template>
    <ons-scroll>
        <component v-for="widget in cardWidgets" class="widget" :allNodes="allNodes" :formContext="formContext" :tile="tile" :widget="widget" :save="throttle(save, saveDelay)" v-bind:is="'base-widget'"></component>
    </ons-scroll>
</template>
<script>
export default {
    name: 'ResourceEditForm',
    props: ['formContext', 'card', 'saving', 'tile'],
    data() {
        return {
            allWidgets: this.$store.getters.activeGraph.widgets,
            allNodes: this.$store.getters.activeGraph.nodes,
            project: this.$store.getters.activeProject,
            saveDelay: 800,
            timer: null
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
                if (!!this.card){
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
        throttle: function(fn, delay) {
            var self = this;
            return function () {
                var context = this, args = arguments;
                clearTimeout(self.timer);
                self.timer = setTimeout(function () {
                    fn.apply(context, args);
                }, delay);
            };
        },
        save: function() {
            console.log('saving...');
            console.log(this.tile.data)
            //this.saving = true;
            this.$emit('update:saving', true);
            var self = this;

            this.$store.dispatch('persistTile', this.tile)
                .then(function(doc) {
                    return doc;
                })
                .finally(function() {
                    console.log('tile save finished...');
                    //self.saving = false;
                    window.setTimeout(function(){
                        self.$emit('update:saving', false);
                    }, 2000);
                });
            this.$store.dispatch(
                'getResource', {
                    projectid: this.project.id,
                    resourceid: this.$store.getters.activeServer.active_resource
                }
            ).then((res) => {
                var resource = res['docs'][0];
                var date = new Date();
                resource['edited'] = {
                    'day': date.toDateString(),
                    'time': date.toTimeString()
                };
                this.$store.dispatch('persistResource', resource)
                    .then(function(doc) {
                        return doc;
                    })
                    .finally(function() {
                        console.log('resource save finished...');
                    });
            });
        },
        save2: function(tile) {
            console.log('saving...');
            this.$store.dispatch('persistTile', tile)
                .then(function(doc) {
                    return doc;
                })
                .finally(function() {
                    console.log('tile save finished...');
                });
            this.$store.dispatch(
                'getResource', {
                    projectid: this.project.id,
                    resourceid: this.$store.getters.activeServer.active_resource
                }
            ).then((res) => {
                var resource = res['docs'][0];
                var date = new Date();
                resource['edited'] = {
                    'day': date.toDateString(),
                    'time': date.toTimeString()
                };
                this.$store.dispatch('persistResource', resource)
                    .then(function(doc) {
                        return doc;
                    })
                    .finally(function() {
                        console.log('resource save finished...');
                    });
            });
        }
    }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.widget {
    padding: 15px;
}
</style>
