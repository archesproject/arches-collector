<template>
    <div v-if="context=='editor'">
        <div class="label">{{widget.label}}</div>
        <!-- <input :value="selectedOption.valueid"> -->
        <multiselect v-model="selectedOption" :placeholder="placeholder" :options="options" :show-labels="false" track-by="valueid" label="value" @input="onChange">
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
    name: 'ConceptWidget',
    props: ['value', 'widget', 'context'],
    data() {
        return {
            placeholder: this.widget.config.placeholder
        };
    },
    computed: {
        options() {
            var self = this;
            var ret = [];
            this.widget.config.options.forEach(function(option){
                ret.push({
                    value: option[0].value,
                    valueid: option[0].valueid,
                    depth: option[1]
                })
            })
            return ret;
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
            //console.log(value);
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
