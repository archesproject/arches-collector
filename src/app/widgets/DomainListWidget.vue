<template>
    <div v-if="context=='editor'">
        <div class="label">{{widget.label}}</div>
        <multiselect v-model="selectedOptions" :placeholder="placeholder" :close-on-select="false" :options="options" :multiple="true" :taggable="true" track-by="valueid" label="value" @input="onChange">
        </multiselect>
        
    </div>
    <div v-else-if="context=='report'">
        <div class="label">{{widget.label}}</div>
        <div class="widget-value">{{value}}</div>
    </div>
</template>


<script>
export default {
    name: 'DomainListWidget',
    props: ['value', 'widget', 'node', 'context'],
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
            // console.log(value);
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
