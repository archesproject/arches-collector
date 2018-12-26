<template>
    <v-ons-page>
        <project-map :extent="project.bounds"></project-map>
    </v-ons-page>
</template>

<script>
export default {
    name: 'ProjectMapPage',
    props: ['project', 'pageActive'],
    data() {
        return {};
    },
    computed: {
        records_to_sync() {
            return this.$store.getters.resourcesToSync;
        }
    }
};
</script>
