<template>
    <div class="widget-panel" v-if="context=='editor'">
        <div class="editor widget-label">{{widget.label}}</div>
        <input :value="value" :placeholder="placeholder" @input="$emit('update:value', $event.target.value)">
    </div>
    <ons-row class="report-widget" v-else-if="context=='report'">
        <ons-col>
            <span class="report widget-label">{{widget.label}}</span>
            <span class="report widget-value">{{value}}</span>
        </ons-col>
    </ons-row>
    <span class="flex tile-data" v-else-if="context=='nav'">
        <div v-if="!!value">{{value}}</div>
        <div v-else>no data</div>
        <div class="widget-label">{{widget.label}}</div>
    </span>
</template>


<script>
export default {
    name: 'EDTFWidget',
    props: ['value', 'widget', 'context'],
    data() {
        //console.log("value:", this.value)
        return {
            placeholder: this.widget.config.placeholder,
            local_value: this.value
        };
    },
    methods: {
        onChange (ret) {
            // var ret = [];
            // selectedOptions.forEach(function(option){
            //     ret.push(option.value);
            // })
            this.local_value = ret.target.value;
            this.$emit('update:value', ret.target.value);
            //this.$emit('update:value', $event.target.value);
        }
    },
    beforeUpdate: function() {
        console.log('beforeUpdate', this.local_value)
    }
};
</script>

<style scoped>
.widget-panel {
    padding-bottom: 25px;
    background: #fbfbfb;
    border-bottom: 1px solid #ddd;
}
</style>
