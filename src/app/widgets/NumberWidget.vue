<template>
    <div v-if="context=='editor'">
        <div class="label">{{widget.label}}</div>
        <input :value="value" type=number placeholder="derive from configs" @input="$emit('update:value', $event.target.value);"/>
    </div>
    <div v-else-if="context=='report'">
        <div class="label">{{widget.label}}</div>
        <div class="widget-value">{{value}}</div>
    </div>
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
    mounted() {
        console.log('this', this.context, this.tile);
    },
    computed: {
    }
};
</script>

<style scoped>

.label {
    padding: 5px;
    width: 100%;
    font-weight: 600;
}

.widget-value {
    padding-left: 15px;
}

</style>
