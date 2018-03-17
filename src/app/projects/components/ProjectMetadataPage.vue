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
                <v-ons-button modifier="medium" :disabled="syncing" class="btn-success" style="width: 150px;" v-on:click="sync">
                    <v-ons-icon v-if="!syncing && !sync_failed" icon="ion-android-sync" class="sync-spinner"></v-ons-icon>
                    <v-ons-icon v-if="sync_failed" icon="ion-android-alert" class="sync-spinner"></v-ons-icon>
                    <v-ons-progress-circular v-if="syncing" indeterminate class="sync-spinner-offset">
                    </v-ons-progress-circular>
                    {{sync_btn_text}}
                </v-ons-button>
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
            syncing: false,
            sync_failed: false
        };
    },
    computed: {
        sync_btn_text() {
            return (this.syncing ? 'Syncing...' : (this.sync_failed ? 'Sync Failed' : 'Sync Now'));
        }
    },
    methods: {
        sync: function() {
            var self = this;
            this.syncing = true;
            this.sync_failed = false;
            //return setTimeout(function(){
                self.$store.dispatch('syncRemote', self.project.id)
                    .catch(function() {
                        self.sync_failed = true;
                    })
                    .finally(function(doc) {
                        console.log('syncing done');
                        self.syncing = false;
                    });
            //}, 2000);
        },
        deleteProject: function() {}
    },
    mounted() {
        var self = this;
        console.log('mounted');
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
    .sync-spinner {
        width: 20px;
        height: 20px;

    }
    .sync-spinner-offset {
        width: 20px;
        height: 20px;
        position: relative;
        left: -5px;
        top: 6px;
    }
</style>
