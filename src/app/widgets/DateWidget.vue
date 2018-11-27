<template>
    <div v-if="context=='editor'">
        <div class="editor widget-label">{{widget.label}}</div>
        <datetime v-model="date_value" @input="onChange"></datetime>
    </div>
    <ons-row class="report-widget" v-else-if="context=='report'">
        <ons-col class="report widget-label">{{widget.label}}</ons-col>
        <ons-col class="report widget-value">{{value}}</ons-col>
    </ons-row>
</template>


<script>
export default {
    name: 'DateWidget',
    props: ['value', 'widget', 'context'],
    data() {
        return {
            'date_value': this.value
        };
    },
    methods: {
        onChange(value) {
            if(value !== this.value){
                this.$emit('update:value', value);
            }
        }
    }
};
</script>

<style scoped>

</style>
