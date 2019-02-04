<template>
    <div class="widget-panel" v-if="context=='editor'">
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
            <ons-col
                <span class="report widget-label">{{widget.label}}</span>
                <span v-for="label in conceptLabels">
                    <span class="report widget-value">{{label.text}}</span>
                </span>
            </ons-col>
        </ons-row>
    </div>
    <span class="flex tile-data" v-else-if="context=='nav'">
        <div class="flex">
            <template v-if="!!conceptLabels">
                <span style="display: inline;" v-for="(label, index) in conceptLabels">
                    <span v-if="index < 2"><span v-if="index > 0 && index < 2">, </span>{{label.text}}</span>
                    <span v-else-if="index == 2">, ...</span>
                </span>
            </template>
            <div v-else>no data</div>
        </div>
        <div class="widget-label">{{widget.label}}</div>
    </span>
</template>


<script>
import concept from '../shared/mixins/concepts';

export default {
    name: 'ConceptListWidget',
    props: ['value', 'widget', 'context'],
    mixins: [concept],
    data() {
        return {
            placeholder: this.widget.config.placeholder,
            local_value: null
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
                var val = this.local_value || this.value;
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
    background: #fbfbfb;
    border-bottom: 1px solid #ddd;
}

.widget-panel.widget {
    padding-bottom: 25px;
}

.test > input.search{
    height: 30px;
}

.widget-value {
  padding-left: 5px;
}

.widget-label {
  font-weight: 400;
  color: #271F4C;
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
