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
        <div class="report widget-label">{{widget.label}}</div>
        <div v-for="label in conceptLabels">
            <div class="report widget-value">{{label.value}}</div>
        </div>
    </div>
</template>


<script>
import concept from '../shared/mixins/concepts';

export default {
    name: 'ConceptListWidget',
    props: ['value', 'widget', 'context'],
    mixins: [concept],
    data() {
        return {
            placeholder: this.widget.config.placeholder
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
    mounted() {
        this.init();
    },
    methods: {
        init() {
            console.log(this);
            console.log(this.conceptLabels);
        },
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
