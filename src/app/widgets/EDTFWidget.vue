<template>
    <div class="widget-panel" v-if="context=='editor'">
        <div class="editor widget-label">{{widget.label}}</div>
        <div class="edtf-message">(This is a fuzzy date value)</div>
        <input :value="value" :placeholder="placeholder" @input="$emit('update:value', $event.target.value);">
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
        return {
            placeholder: this.widget.config.placeholder
        };
    }
};
</script>

<style scoped>
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

.widget-panel input {
  color: steelblue;
}

.edtf-message {
    color: #999;
    font-size: 13px;
    padding-bottom: 3px;
}
</style>
