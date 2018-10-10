<template>
    <div>
    <v-ons-input
      placeholder="derive from configs"
      :value="value"  @input="$save()">
    </v-ons-input>
    </div>
</template>


<script>
export default {
    name: 'ConceptWidget',
    props: ['value', 'save'],
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
