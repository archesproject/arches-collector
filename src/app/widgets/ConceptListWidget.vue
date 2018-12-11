<template>
    <div v-if="context=='editor'">
        <div class="editor widget-label">{{widget.label}}</div>
        <multi-select class="test"
            :selected-options="selectedOptions"
            :options="options"
            :placeholder="placeholder"
            @select="onChange">
        </multi-select>
    </div>
    <div class="report-widget" v-else-if="context=='report'">
        <ons-row>
            <ons-col class="report widget-label">{{widget.label}}</ons-col>
            <ons-col>
            <div v-for="label in conceptLabels">
                <div class="report widget-value">{{label.text}}</div>
            </div>
            </ons-col>
        </ons-row>
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
                    text: option[0].value,
                    value: option[0].valueid,
                    depth: option[1]
                })
            })
            return options;
        },
        selectedOptions: {
            get: function() {
                var ret = [];
                var val = this.value;
                if(!Array.isArray(val)) {
                    val = [val];
                }
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
            this.$emit('update:value', ret);
        }
    }
};
</script>

<style scoped>
    .test > input.search{
        height: 30px;
    }
</style>
