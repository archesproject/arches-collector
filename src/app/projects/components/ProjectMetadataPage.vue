<template>
    <div>
        <v-ons-button modifier="large" class="btn-success" v-on:click="sync">Sync</v-ons-button>
        <v-ons-button modifier="large quiet" class="btn-danger" style="margin-top: 10px;" v-on:click="deleteProject">Delete Project</v-ons-button>
        <div>
            Project Description:
        </div>
        <div>
            {{project.description}}
        </div>
        <div>
            Project Changes:
        </div>
        <div>
            {{pageActive}}
            {{changes}}
        </div>

    </div>
</template>

<script>
export default {
    name: 'ProjectMetadataPage',
    props: ['project', 'pageActive'],
    data() {
        return {
            changes: null
        };
    },
    methods: {
        sync: function() {
            this.$store.dispatch('syncProjectWPouch', this.project.id);
            // .finally(function(doc){

            // });
        },
        deleteProject: function() {}
    },
    mounted() {
        var self = this;
        console.log('mounted'); // I'm text inside the component.
        this.$store.dispatch('getProjectChanges', this.project.id)
            .finally(function(doc) {
                self.changes = doc;
            });
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
