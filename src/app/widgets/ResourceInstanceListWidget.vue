<template>
    <div class="widget-panel" v-if="context=='editor'">
        <div class="editor widget-label">{{widget.label}}</div>
        <model-select
            :options="options"
            :placeholder="placeholder"
            @input="onSelect
        ">
        </model-select>
        <div style="display: flex; flex-direction: column; padding-top: 10px;">
            <div class='rr-table-row' v-for="val in selectedOptions">
                <div style="display: flex; flex-direction: row; height: 40px;">
                    <div class='rr-table-column' style="width: 35px;">
                        <button v-on:click="onDelete(val)">
                            <i class="fa fa-trash"></i>
                        </button>
                    </div>
                    <div class="rr-table-column" style="flex-grow: 1;" v-bind:style="{paddingTop: ontologyInfo(val) === '' ?  '12px' : '3px'}">
                        <div>{{val.resourceName}}</div><div style="font-size: 10px;">{{ontologyInfo(val)}}</div>
                    </div>
                </div>
            </div>
        </div>
        
    </div>
    <ons-row class="report-widget" v-else-if="context=='report'">
        <ons-col>
          <span class="report widget-label">{{widget.label}}</span>
          <span v-for="(item, index)  in selectedOptions">
              <span class="report widget-value"><span v-if="index > 0">, </span>{{item.resourceName}}</span>
          </span>
        </ons-col>
    </ons-row>
    <span class="flex tile-data" v-else-if="context=='nav'">
        <div class="flex">
            <template v-if="selectedOptions.length > 0">
                <span style="display: inline;" v-for="(item, index) in selectedOptions">
                    <span v-if="index < 2"><span v-if="index > 0 && index < 2">, </span>{{item.resourceName}}</span>
                    <span v-else-if="index == 2">, ...</span>
                </span>
            </template>
            <div v-else>no data</div>
        </div>
        <div class="widget-label">{{widget.label}}</div>
    </span>
</template>

<script>

import ontology from '../shared/mixins/ontology';

export default {
    name: 'ResourceInstanceListWidget',
    props: ['value', 'widget', 'node', 'context'],
    mixins: [ontology],
    data() {
        !Array.isArray(this.value) ? this.value = [] : false;
        return {
            placeholder: this.widget.config.placeholder,
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
        selectedOptions: {
            get: function() {
                var self = this;
                var ret = [];
                var val = !Array.isArray(this.value) ? [] : this.value;
                if (!!val) {
                    val.forEach(function(item) {
                        if(item.hasOwnProperty('resourceName') === false){
                            Object.defineProperty(item, 'resourceName', {value: self.optionsLookup[item.resourceId].name});
                        }
                        ret.push(item);
                    });
                }
                return ret;
            },
            set: function() {

            }
        }
    },
    methods: {
        ontologyInfo(item) {
            if(item.ontologyProperty || item.inverseOntologyProperty) {
                return '(' + this.makeFriendly(item.ontologyProperty) + '/' + this.makeFriendly(item.inverseOntologyProperty) + ')';
            } else {
                return '';
            }
        },
        onSelect(resourceId) {
            var defaults = this.optionsLookup[resourceId];
            var config = this.nodeConfigLookup[defaults.graphid];
            var item = {
                "resourceId": resourceId,
                "ontologyProperty": !!config.ontologyProperty ? config.ontologyProperty : "",
                "inverseOntologyProperty": !!config.inverseOntologyProperty ? config.inverseOntologyProperty : "",
                "resourceXresourceId": ""
            };
            Object.defineProperty(item, 'resourceName', {value: defaults.name});
            this.value = this.value.concat(item);
            this.$emit('update:value', this.selectedOptions);
        },
        onDelete(resourceInstance) {
            console.log('in onDelete');
            var idx = this.value.findIndex(function(item) {
                return item.resourceId === resourceInstance.resourceId;
            }, this);
            if(idx !== -1) {
                this.value.splice(idx, 1)
                this.$emit('update:value', this.selectedOptions);
            }
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

.widget-panel.widget {
    padding-bottom: 25px;
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

.rr-table-row {
    min-height: 40px;
    display: flex;
    border-bottom: solid 1px #e0e0e0;
    flex-direction: column;
    overflow: hidden;
}

.rr-table-row:first-child {
    border-top: solid 1px #e0e0e0;
}

.rr-table-row:nth-last-child(odd) {
    background: rgb(236, 240, 245);
}

.rr-table-column {
    padding-top: 12px;
    padding-left: 10px;
    border-left: solid 1px #e0e0e0;
}

.rr-table-column:last-child {
    border-right: solid 1px #e0e0e0
}

.rr-table-column button {
    padding: 0px;
    color: #5f5f5f;
    border: none;
    background: none;
}
</style>
