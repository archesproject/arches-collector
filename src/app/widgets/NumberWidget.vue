<template>
    <div v-if="context=='editor'">
        <div class="editor widget-label">{{widget.label}}</div>
        <input :value="value" type=number placeholder="derive from configs" @input="$emit('update:value', $event.target.value);"/>
    </div>

    <ons-row class="report-widget" v-else-if="context=='report'">
        <ons-col class="report widget-label">{{widget.label}}</ons-col>
        <ons-col class="report widget-value">{{value}}</ons-col>
    </ons-row>
    <span class="flex tile-data" v-else-if="context=='nav'">
        <div>{{value}}</div>
        <div class="widget-label">{{widget.label}}</div>
    </span>
</template>


<script>
export default {
    name: 'NumberWidget',
    props: ['value', 'widget', 'context'],
    data() {
        return {};
    },
    methods: {
    },
    computed: {
    }
};
</script>

<style scoped>
</style scoped>
