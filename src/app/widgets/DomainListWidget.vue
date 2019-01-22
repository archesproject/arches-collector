<template>
    <div class="report-widget" v-if="context=='editor'">
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
</template>


<script>
import concept from '../shared/mixins/concepts';

export default {
    name: 'DomainListWidget',
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
            this.node.config.options.forEach(function(option){
                options.push({
                    text: option.text,
                    value: option.id
                })
            })
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
.widget-panel {
    padding-bottom: 25px;
    background: #fbfbfb;
    border-bottom: 1px solid #ddd;
}
</style>
