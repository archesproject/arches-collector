<template>
    <div>
    <v-ons-input
      placeholder="derive from configs"
      v-model="nodeval">
    </v-ons-input>
    <v-ons-icon class="text-color-dark icon" icon="fa-pencil" v-if="dirty === true"></v-ons-icon>
    </div>
</template>


<script>
export default {
    name: 'ConceptWidget',
    props: ['value'],
    data() {
        return {
            nodeval: this.value
        };
    },
    methods: {
    },
    computed: {
        dirty: {
            get: function() {
                return this.nodeval != this.value;
            }
        }
    }
};
</script>

<style scoped>
</style>
