<template>
    <v-ons-page>
        <v-ons-row>
            <v-ons-col>
                <div class="large-text">30</div>
                <span class="sub-text">Records Edited</span>
            </v-ons-col>
            <v-ons-col>
                <div class="large-text">12</div>
                <span class="sub-text">Records to Sync</span>
            </v-ons-col>
            <v-ons-col>
                <div class="large-text">{{project.lastsync.date}}<span class="sub-text" style="vertical-align: 14px;">{{project.lastsync.time}}</span></div>
                <span class="sub-text">Date/Time of Last Sync</span>
            </v-ons-col>
        </v-ons-row>

        <v-ons-row style="margin-top: 35px;">
            <v-ons-col>
                <v-ons-button modifier="medium" class="btn-success" style="width: 100px;" v-on:click="sync">Sync</v-ons-button>
            </v-ons-col>
            <v-ons-col>
                <v-ons-button modifier="large outline" class="btn-danger" v-on:click="deleteProject">Forget Project</v-ons-button>
            </v-ons-col>
        </v-ons-row>

        
        <div style="padding-top: 24px; padding-bottom: 8px;">
            Project Description:
        </div>
        <div>
            {{project.description}}
        </div>
    </v-ons-page>
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
            this.$store.dispatch('syncRemote', this.project.id);
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
    .sub-text {
        font-size: x-small;
        color: grey;
    }
    .large-text {
        font-size: 26px;
        color: #4d4b65
    }
</style>
