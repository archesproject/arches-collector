<template>
    <div>
        <!-- Scrollable content here -->
        <ons-scroll infinit-scroll-enable="true" on-scrolled="pagination.nextPage()" can-load="true" threshold='100'>
            <div class="tree-content">A resource editor tree goes here</div>
        </ons-scroll>
   </div>
</template>

<script>
export default {
    name: 'ResourceMapPage',
    props: ['id'],
    data() {
        return {
            project: this.$store.getters.activeProject,
            resourceid: this.$store.getters.activeServer.active_resource
        };
    },
    computed: {
        tiles: {
            get: function() {
                return this.$store.getters.tiles;
            }
        }
    },
    methods: {
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.tree-content {
    padding: 15px;
}

</style>
