<template>
    <div>
    <v-ons-input
      placeholder="derive from configs"
      :value="value" @input="$emit('update:value', $event.target.value)">
    </v-ons-input>
    </div>
</template>


<script>
export default {
    name: 'StringWidget',
    props: ['value'],
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
