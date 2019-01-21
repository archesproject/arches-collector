<template>
    <div v-if="context=='editor'">
        <div class="editor widget-label">{{widget.label}}</div>
        <datetime v-model="date_value" @input="onChange"></datetime>
    </div>
    <ons-row class="report-widget" v-else-if="context=='report'">
        <ons-col
            <span class="report widget-label">{{widget.label}}</span>
            <span class="report widget-value">{{value}}</span>
        </ons-col>
    </ons-row>
    <span class="flex tile-data" v-else-if="context=='nav'">
        <div>{{value}}</div>
        <div class="widget-label">{{widget.label}}</div>
    </span>
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
.widget-value {
  padding-left: 5px;
}

.widget-label {
  font-weight: 600;
  color: #271F4C;
}

</style>
