<template>
    <div class="widget-panel" v-if="context=='editor'">
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
            <span class="report widget-value">{{conceptLabel.text}}</span>
        </ons-col>
    </ons-row>
    <span class="flex tile-data" v-else-if="context=='nav'">
        <div v-if="!!conceptLabel">{{conceptLabel.text}}</div>
        <div v-else>no data</div>
        <div class="widget-label">{{widget.label}}</div>
    </span>
</template>

<script>
import concept from '../shared/mixins/concepts';

export default {
    name: 'ResourceInstanceWidget',
    props: ['value', 'widget', 'node', 'context'],
    mixins: [concept],
    data() {
        return {
            placeholder: this.widget.config.placeholder,
            local_value: null
        };
    },
    computed: {
        options() {
            var self = this;
            var options = [];
            if (!!this.node.config.options) {
                this.node.config.options.forEach(function(option) {
                    options.push({
                        text: option.name,
                        value: option.id
                    });
                });
            }
            return options;
        },
        selectedOption: {
            get: function() {
                var ret = {};
                var val = this.local_value || this.value;
                this.options.forEach(function(option) {
                    if (option.value === val) {
                        ret = option;
                    }
                });
                return ret;
            },
            set: function() {

            }
        }
    },
    methods: {
        onChange(option) {
            var ret = null;
            if (!!option) {
                ret = option.value;
            }
            this.local_value = ret;
            this.$emit('update:value', ret);
        }
    }
};
</script>

<style scoped>

.widget-panel {
    padding-bottom: 25px;
    background: #fbfbfb;
    border-bottom: 1px solid #ddd;
}

.widget-panel.widget {
    padding-bottom: 25px;
}

.widget-label {
  font-weight: 400;
  color: #271F4C;
  padding-right: 5px;
}

.report-widget {
    padding-bottom: 3px;
}

.tile-data {
    background: #fafafa;
    color: #888;
    margin-left: -5px;
    padding-left: 5px;
}

.tile-data .widget-label {
    color: #271F4C;
    font-size: 13px;
    padding-bottom: 10px;
}

</style>
