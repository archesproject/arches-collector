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
        <ons-col class="report widget-label">{{widget.label}}</ons-col>
        <ons-col class="report widget-value">{{conceptLabel.text}}</ons-col>
    </ons-row>
</template>


<script>
import concept from '../shared/mixins/concepts';

export default {
    name: 'ResourceInstanceWidget',
    props: ['value', 'widget', 'node', 'context'],
    mixins: [concept],
    data() {
        return {
            placeholder: this.widget.config.placeholder
        };
    },
    computed: {
        options() {
            var self = this;
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
        selectedOption: {
            get: function() {
                var self = this;
                var ret = {};
                this.options.forEach(function(option){
                     if(option.value === self.value){
                        ret = option;
                    }
                })
                return ret;

            },
            set: function() {

            }
        }
    },
    methods: {
        onChange(option) {
            var ret = null
            if(!!option) {
                ret = option.value;
            }
            this.$emit('update:value', ret);
        }
    }
};
</script>

<style scoped>
</style>
