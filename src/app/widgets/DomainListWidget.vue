<template>
    <div v-if="context=='editor'">
        <div class="editor widget-label">{{widget.label}}</div>
        <multiselect v-model="selectedOptions" :placeholder="placeholder" :close-on-select="false" :options="options" :multiple="true" :taggable="true" track-by="valueid" label="value" @input="onChange">
        </multiselect>

    </div>
    <ons-row class="report-widget" v-else-if="context=='report'">
        <ons-col class="report widget-label">{{widget.label}}</ons-col>
        <ons-col>
            <div v-for="label in conceptLabels">
                <div class="report widget-value">{{label.value}}</div>
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
        return {
            placeholder: this.widget.config.placeholder
        };
    },
    computed: {
        options() {
            var options = [];
            this.node.config.options.forEach(function(option){
                options.push({
                    value: option.text,
                    valueid: option.id
                })
            })
            return options;
        },
        selectedOptions: {
            get: function() {
                var self = this;
                var ret = [];
                var val = this.value;
                if(!Array.isArray(this.value)) {
                    val = [this.value];
                }
                this.options.forEach(function(option) {
                    if(val.includes(option.valueid)) {
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
        onChange (value) {
            var ret = [];
            value.forEach(function(val){
                ret.push(val.valueid);
            })
            this.$emit('update:value', ret);
        }
    }
};
</script>

<style scoped>
</style>
