<template>
    <div v-if="context=='editor'">
        <div class="label">{{widget.label}}</div>
        <input :value="value" placeholder="derive from configs" @input="$emit('update:value', $event.target.value);">
    </div>
    <div v-else-if="context=='report'">
        <div class="label">{{widget.label}}</div>
        <div class="widget-value">{{value}}</div>
    </div>
</template>


<script>
export default {
    name: 'GeojsonFeatureCollectionWidget',
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
</style>
