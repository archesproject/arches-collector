<template>
    <div class="widget-panel" v-if="context=='editor'">
        <div class="editor widget-label">{{widget.label}}</div>
        <model-select
            v-model="selectedOption"
            :options="options"
            :placeholder="placeholder"
            @input="onChange">
        </model-select>
    </div>
    <ons-row class="report-widget" v-else-if="context=='report'">
        <ons-col>
            <span class="report widget-label">{{widget.label}}</span>
            <span class="report widget-value">{{selectedOption.text}}</span>
        </ons-col>
    </ons-row>
    <span class="flex tile-data" v-else-if="context=='nav'">
        <div v-if="!!selectedOption">{{selectedOption.text}}</div>
        <div v-else>no data</div>
        <div class="widget-label">{{widget.label}}</div>
    </span>
</template>

<script>

export default {
    name: 'ResourceInstanceWidget',
    props: ['value', 'widget', 'node', 'context'],
    data() {
        !Array.isArray(this.value) ? this.value = [] : false;
        return {
            placeholder: this.widget.config.placeholder,
            local_value: null,
            options: this.node.config.options.map(function(item){
                item.text = item.name;
                item.value = item.id;
                return item;
            }),
            optionsLookup: this.node.config.options.reduce(function(acc, curr){
                acc[curr.id] = curr;
                return acc;
            }, {}),
            nodeConfigLookup: this.node.config.graphs.reduce(function(acc, curr){
                acc[curr.graphid] = curr;
                return acc;
            }, {})
        };
    },
    computed: {
        selectedOption: {
            get: function() {
                var ret = {};
                var val = !Array.isArray(this.value) ? [] : this.local_value || this.value;
                if (!!val && val.length > 0) {
                    ret = this.options.find(function(option) {
                        return option.value === val[0].resourceId;
                    });
                    if (!ret) {
                        ret = {};
                    }
                }
                return ret;
            },
            set: function() {

            }
        }
    },
    methods: {
        onChange(option) {
            var ret = null;
            if (!!option) {
                var defaults = this.optionsLookup[option.value];
                var config = this.nodeConfigLookup[defaults.graphid];
                var ret = [{
                    "resourceId": option.value,
                    "ontologyProperty":config.ontologyProperty,
                    "inverseOntologyProperty": config.inverseOntologyProperty,
                    "resourceXresourceId": ""
                }];
                Object.defineProperty(ret[0], 'resourceName', {value: defaults.name});
            }
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

.widget-panel.widget {
    padding-bottom: 25px;
}

.widget-label {
  font-weight: 400;
  color: #271F4C;
  padding-right: 5px;
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
