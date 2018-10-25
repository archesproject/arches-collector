<template>
    <div>
        <div class="label">{{widget.label}}</div>
        <input :value="value" :placeholder="placeholder" @input="$emit('update:value', $event.target.value);">
    </div>
</template>


<script>
export default {
    name: 'StringWidget',
    props: ['value', 'widget'],
    data() {
        return {
            placeholder: this.widget.config.placeholder
        };
    },
    methods: {
    },
    computed: {
    }
};
</script>

<style scoped>
</style>
