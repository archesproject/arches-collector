<template>
    <div v-if="context=='editor'">
        <div class="label">{{widget.label}}</div>
        <!-- <input :value="value"> -->
        <v-ons-select v-model="selectedOption" @input="$emit('update:value', $event.target.value);">
            <option v-if="!value" disabled :value="-1">{{ placeholder }}</option>
            <option v-for="option in options" :value="option.valueid">
                <span v-for="n in option.depth-1">&nbsp;&nbsp;&nbsp;&nbsp;</span>{{ option.value }}
            </option>
        </v-ons-select>
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
            placeholder: this.widget.config.placeholder,
        };
    },
    computed: {
        options() {
            var self = this;
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
        selectedOption: {
            get: function() {
                var self = this;
                var ret = -1;
                this.options.forEach(function(option){
                     if(option.valueid === self.value){
                        ret = option.valueid;
                    }
                })
                return ret;
            },
            set: function(val){
                // ignore this for now
            }
        }
    }
};
</script>

<style scoped>
</style>
