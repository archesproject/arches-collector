<template>
    <component :value.sync="value" :context.sync="context" v-bind:is="widgetComponent" :tile="tile" :widget="widget" :node="node"></component>
</template>

<script>
import semverSatisfies from 'semver/functions/satisfies';
export default {
    name: 'BaseWidget',
    props: ['allNodes', 'widget', 'save', 'tile', 'context'],
    data() {
        return {
            waiting: false,
            project: this.$store.getters.activeProject,
            user: this.$store.getters.activeServer.user
        };
    },
    methods: {
        createNewProvisionalEdit: function() {
            var self = this;
            var tileData = {};

            // use athoritative edits if possible
            // else try and get the latest provistional edit to show
            if (!!this.tile && Object.keys(this.tile.data).length > 0) {
                tileData = JSON.parse(JSON.stringify(this.tile.data));
            } else {
                Object.keys(this.tile.provisionaledits).forEach(function(key, index) {
                    if (index === 0) {
                        tileData = self.tile.provisionaledits[key];
                    } else {
                        if (new Date(tileData.timestamp) < new Date(self.tile.provisionaledits[key].timestamp)) {
                            tileData = self.tile.provisionaledits[key];
                        }
                    }
                });

                tileData = !!tileData && !!tileData.value ? JSON.parse(JSON.stringify(tileData.value)) : tileData;
            }
            return {
                action: 'create',
                reviewer: null,
                reviewtimestamp: null,
                status: 'review',
                timestamp: '',
                value: tileData
            };
        }
    },
    computed: {
        widgetComponent: {
            get: function() {
                var server = this.$store.getters.activeServer;
                var widgetComponentName = this.node.datatype + '-widget';
                var widgetMappingItem = this.$widgetMapping[widgetComponentName];
                if (widgetMappingItem.hasOwnProperty('widgetVersions')) {
                    // this widget is versioned
                    var version = Object.keys(widgetMappingItem['widgetVersions']).find(function(version) {
                        return semverSatisfies(server.version, version);
                    });
                    if (!!version) {
                        return Object.keys(widgetMappingItem['widgetVersions'][version])[0];
                    }
                }

                // this widget isn't versioned or we can't find a versioned match then default to the latest version
                return widgetComponentName;
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
                        provisionaledit = this.tile.provisionaledits[this.user.id].value;
                    } else {
                        this.tile.provisionaledits[this.user.id] = this.createNewProvisionalEdit();
                        provisionaledit = this.tile.provisionaledits[this.user.id].value;
                    }

                    if (!provisionaledit.hasOwnProperty(this.widget.node_id)) {
                        if (this.widget.config.defaultValue) {
                            provisionaledit[this.widget.node_id] = this.widget.config.defaultValue;
                        } else {
                            provisionaledit[this.widget.node_id] = '';
                        }
                    }
                    return provisionaledit[this.widget.node_id];
                } catch (err) {
                    // I don't know why we can't return an empty string here, but if we do then
                    // we end of having this problem
                    // https://github.com/archesproject/arches-mobile/issues/310
                    return null;
                }
            },
            set: function(newValue) {
                if (this.tile) {
                    this.tile.provisionaledits[this.user.id].value[this.widget.node_id] = newValue;
                    this.tile.provisionaledits[this.user.id].timestamp = new Date().toJSON();
                    this.save();
                }
            }
        }
    }
};
</script>

<style src="semantic-ui-css/semantic.css"></style>

<style scoped>

</style>
