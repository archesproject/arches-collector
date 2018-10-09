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
    name: 'StringWidget',
    props: ['value'],
    data() {
        return {
            val: this.value
        };
    },
    methods: {
    },
    computed: {
        nodeval: {
            get: function() {
                return this.value;
            },
            set: function(newVal) {
                this.val = newVal;
            }
        },
        dirty: {
            get: function() {
                return this.nodeval !== this.value;
            }
        }
    }
};
</script>

<style scoped>
</style>
