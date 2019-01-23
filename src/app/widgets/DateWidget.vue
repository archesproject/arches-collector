<template>
    <div class="widget-panel" v-if="context=='editor'">
        <div class="editor widget-label">{{widget.label}}</div>
        <datetime v-model="date_value" @input="onChange" value-zone="local"></datetime>
    </div>
    <ons-row class="report-widget" v-else-if="context=='report'">
        <ons-col
            <span class="report widget-label">{{widget.label}}</span>
            <span class="report widget-value">{{formatted}}</span>
        </ons-col>
    </ons-row>
    <span class="flex tile-data" v-else-if="context=='nav'">
        <div v-if="!!value">{{value}}</div>
        <div v-else>no data</div>
        <div class="widget-label">{{widget.label}}</div>
    </span>
</template>


<script>
import moment from 'moment';
export default {
    name: 'DateWidget',
    props: ['value', 'widget', 'context'],
    data() {
        return {
            'date_value': this.value
        };
    },
    computed: {
        formatted: {
            get: function() {
                return moment(this.value).format('MMMM Do YYYY');
            }
        }
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
.widget-panel {
    padding-bottom: 25px;
    background: #fbfbfb;
    border-bottom: 1px solid #ddd;
}

.widget-value {
  padding-left: 5px;
}

.widget-label {
  font-weight: 400;
  color: #271F4C;
}

</style>
