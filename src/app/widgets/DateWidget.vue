<template>
    <div class="widget-panel" v-if="context=='editor'">
        <div class="editor widget-label">{{widget.label}}</div>
        <datetime v-model="localValue" value-zone="local"></datetime>
    </div>
    <ons-row class="report-widget" v-else-if="context=='report'">
        <ons-col
            <span class="report widget-label">{{widget.label}}</span>
            <span class="report widget-value">{{formatted}}</span>
        </ons-col>
    </ons-row>
    <span class="flex tile-data" v-else-if="context=='nav'">
        <div v-if="!!formatted">{{formatted}}</div>
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
        return {};
    },
    computed: {
        localValue: {
            get: function() {
                return this.value;
            },
            set: function(value) {
                this.$emit('update:value', moment(value, 'YYYY-MM-DDThh:mm:ss A Z').parseZone().format('YYYY-MM-DD'));
            }
        },
        formatted: {
            get: function() {
                return moment(this.value).format('MMMM Do, YYYY');
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

.widget-panel.widget {
    padding-bottom: 25px;
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
