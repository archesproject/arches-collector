<template>
    <div v-if="context=='editor'">
        <div class="label">{{widget.label}}</div>
        <multiselect v-model="selectedOptions" :placeholder="placeholder" :close-on-select="false" :options="options" :multiple="true" :taggable="true" track-by="valueid" label="value" @input="onChange">
            <template slot="option" slot-scope="props">
              <div class="option__desc"><span class="option__title"><span v-for="n in props.option.depth-1">&nbsp;&nbsp;&nbsp;&nbsp;</span>{{ props.option.value }}</span></div>
            </template>
        </multiselect>
        
    </div>
    <div v-else-if="context=='report'">
        <div class="label">{{widget.label}}</div>
        <div class="widget-value">{{value}}</div>
    </div>
</template>


<script>
export default {
    name: 'ConceptListWidget',
    props: ['value', 'widget', 'context'],
    data() {
        return {
            placeholder: this.widget.config.placeholder,
            selectedOptions: []
        };
    },
    computed: {
        options() {
            var options = [];
            this.widget.config.options.forEach(function(option){
                options.push({
                    value: option[0].value,
                    valueid: option[0].valueid,
                    depth: option[1]
                })
            })
            return options;
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
    },
    mounted() {
        var self = this;
        var val = this.value;
        if(!Array.isArray(this.value)) {
            val = [this.value];
        }
        this.options.forEach(function(option){
            if(val.includes(option.valueid)){
                self.selectedOptions.push(option);
            }
        })
    }
};
</script>

<style scoped>
</style>
