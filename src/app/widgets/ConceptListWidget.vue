<template>
    <div>
        <div class="label">{{widget.label}}</div>
        <input :value="value" placeholder="derive from configs" @input="$emit('update:value', $event.target.value);">
    </div>
</template>


<script>
export default {
    name: 'ConceptListWidget',
    props: ['value', 'widget'],
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
