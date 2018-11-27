<template>
    <div v-if="context=='editor'">
        <div class="editor widget-label">{{widget.label}}</div>
        <multiselect v-model="selectedOption" :placeholder="placeholder" :options="options" :show-labels="false" track-by="valueid" label="value" @input="onChange">
        </multiselect>
    </div>
    <ons-row class="report-widget" v-else-if="context=='report'">
        <ons-col class="report widget-label">{{widget.label}}</ons-col>
        <ons-col class="report widget-value">{{value}}</ons-col>
    </ons-row>
</template>


<script>
export default {
    name: 'DomainWidget',
    props: ['value', 'widget', 'node', 'context'],
    data() {
        return {
            placeholder: this.widget.config.placeholder,
        };
    },
    computed: {
        options() {
            var self = this;
            var options = [];
            this.node.config.options.forEach(function(option){
                options.push({
                    value: option.text,
                    valueid: option.id
                })
            })
            return options;
        },
        selectedOption: {
            get: function() {
                var self = this;
                var ret = -1;
                this.options.forEach(function(option){
                     if(option.valueid === self.value){
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
        onChange(value) {
            var ret = null
            if(!!value) {
                ret = value.valueid;
            }
            this.$emit('update:value', ret);
        }
    }
};
</script>

<style scoped>
</style>
