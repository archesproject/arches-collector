<template>
    <div v-if="context=='editor'">
        <div class="label">{{widget.label}}</div>
        <input :value="value" type=number placeholder="derive from configs" @input="$emit('update:value', $event.target.value);"/>
    </div>
    <ons-row class="row" v-else-if="context=='report'">
        <ons-col class="label">{{widget.label}}</ons-col>
        <ons-col class="value">{{value}}</ons-col>
    </ons-row>
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
    color: #555;
}

.value {
    color: #777;
}

.label {
    font-weight: 600;
}

.row {
    align-items: center;
}

</style scoped>
