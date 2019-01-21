<template>
    <div v-if="context=='editor'">
        <div class="editor widget-label">{{widget.label}}</div>
        <multi-select
            :selected-options="selectedOptions"
            :options="options"
            :placeholder="placeholder"
            @select="onChange">
        </multi-select>
    </div>
    <ons-row class="report-widget" v-else-if="context=='report'">
        <ons-col class="report widget-label">{{widget.label}}</ons-col>
        <ons-col>
            <div v-for="label in conceptLabels">
                <div class="report widget-value">{{label.text}}</div>
            </div>
        </ons-col>
    </ons-row>
    <span class="flex tile-data" v-else-if="context=='nav'">
        <div class="flex">
            <span style="display: inline;" v-for="(label, index) in conceptLabels">
                <span v-if="index < 2"><span v-if="index > 0 && index < 2">, </span>{{label.text}}</span>
                <span v-else-if="index == 2">, ...</span>
            </span>
        </div>
        <div class="widget-label">{{widget.label}}</div>
    </span>
</template>


<script>
import concept from '../shared/mixins/concepts';

export default {
    name: 'ResourceInstanceListWidget',
    props: ['value', 'widget', 'node', 'context'],
    mixins: [concept],
    data() {
        var local_value = [];
        if(Array.isArray(this.value)) {
            local_value = this.value;
        }
        return {
            placeholder: this.widget.config.placeholder,
            local_value: local_value
        };
    },
    computed: {
        options() {
            var options = [];
            if(!!this.node.config.options){
                this.node.config.options.forEach(function(option){
                    options.push({
                        text: option.name,
                        value: option.id
                    })
                })
            }
            return options;
        },
        selectedOptions: {
            get: function() {
                var ret = [];
                var val = this.local_value;
                this.options.forEach(function(option) {
                    if(val.includes(option.value)) {
                        ret.push(option);
                    }
                })
                return ret;

            },
            set: function() {

            }
        }
    },
    methods: {
        onChange (selectedOptions, lastSelectedOption) {
            var ret = [];
            selectedOptions.forEach(function(option){
                ret.push(option.value);
            })
            this.local_value = ret;
            this.$emit('update:value', ret);
        }
    }
};
</script>

<style scoped>
</style>
