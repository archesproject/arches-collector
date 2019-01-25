<template>
    <div class="widget-panel" v-if="context=='editor'">
        <div class="editor widget-label">{{widget.label}}</div>
        <multi-select
            :selected-options="selectedOptions"
            :options="options"
            :placeholder="placeholder"
            @select="onChange">
        </multi-select>
    </div>
    <ons-row class="report-widget" v-else-if="context=='report'">
        <ons-col>
          <span class="report widget-label">{{widget.label}}</span>
          <span v-for="label in conceptLabels">
              <span class="report widget-value">{{label.text}}</span>
          </span>
        </ons-col>
    </ons-row>
    <span class="flex tile-data" v-else-if="context=='nav'">
        <div class="flex">
            <template v-if="conceptLabels.length > 0">
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
.report-widget {
    padding-bottom: 3px;
}

.widget-panel {
    padding-bottom: 25px;
    background: #fbfbfb;
    border-bottom: 1px solid #ddd;
}

.widget-label {
  font-weight: 400;
  color: #271F4C;
  padding-right: 5px;
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
