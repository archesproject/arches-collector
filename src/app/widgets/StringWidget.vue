<template>
    <div v-if="context=='editor'">
        <div class="label">{{widget.label}}</div>
        <input :value="value" :placeholder="placeholder" @input="$emit('update:value', $event.target.value);">
    </div>
    <ons-row class="row" v-else-if="context=='report'">
        <ons-col class="label">{{widget.label}}</ons-col>
        <ons-col class="value">{{value}}</ons-col>
    </ons-row>
</template>


<script>
export default {
    name: 'StringWidget',
    props: ['value', 'widget', 'context'],
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
    .label {
        font-weight: 600;
        color: #555;
    }
    .value {
        color: #777;
    }
</style>
