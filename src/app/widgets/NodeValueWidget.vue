<template>
    <div v-if="context=='editor'">
        <div class="editor widget-label">{{widget.label}}</div>
        <model-select
            v-model="selectedOption"
            :options="options"
            :placeholder="placeholder"
            @input="onChange">
        </model-select>
    </div>
    <ons-row class="report-widget" v-else-if="context=='report'">
        <ons-col>
            <span class="report widget-label">{{widget.label}}</span>
            <span class="report widget-value">{{displayValue}}</span>
        </ons-col>
    </ons-row>
</template>

<script>

export default {
    name: 'NodeValueWidget',
    props: ['value', 'widget', 'node', 'tiles', 'context'],
    data() {
        return {
            placeholder: this.widget.config.placeholder,
            local_value: this.value,
            user: this.$store.getters.activeServer.user
        };
    },
    computed: {
        options() {
            var self = this;
            var ret = [];
            
            this.tiles.forEach(function(tile){
                var found = false;
                if (!!tile.provisionaledits && tile.provisionaledits.hasOwnProperty(self.user.id) && !!tile.provisionaledits[self.user.id]) {
                    var provisionaledit = tile.provisionaledits[self.user.id]['value'];
                    if (provisionaledit.hasOwnProperty(self.node.config.nodeid)) {
                        ret.push({
                            value: tile.tileid,
                            text: provisionaledit[self.node.config.nodeid],
                            depth: 1
                        })
                        found = true;
                    }
                }
                if (!found) {
                    if (tile.data.hasOwnProperty(self.node.config.nodeid)) {
                        ret.push({
                            value: tile.tileid,
                            text: tile.data[self.node.config.nodeid],
                            depth: 1
                        })
                    }
                }
            })
            return ret;
        },
        selectedOption: {
            get: function() {
                var self = this;
                var ret = {};
                this.options.forEach(function(option){
                     if(option.value === self.local_value){
                        ret = option;
                    }
                })
                return ret;

            },
            set: function() {

            }
        },
        displayValue: function() {
            return this.selectedOption.text;
        }
    },
    methods: {
        onChange(option) {
            var ret = null
            if(!!option) {
                ret = option.value;
            }
            this.local_value = ret;
            this.$emit('update:value', ret);
        }
    }
};
</script>

<style scoped>
.widget-value {
  padding-left: 5px;
}

.widget-label {
  font-weight: 600;
  color: #271F4C;
}
