<template>
            <v-ons-page>
    <div>
        <div class="section description">
            <div class="description-label">
                Description
            </div>
            <div class="description-text" style="padding-top: 5px;">
                {{project.description}}
            </div>
        </div>
        <div class="section summary">
            <v-ons-row>
                <v-ons-col style="">
                    <div class="date-text">{{project.lastsync.date}}&nbsp;<span class="time-text">{{project.lastsync.time}}</span></div>
                    <span class="status-type-text">Date/Time of Last Sync</span>
                </v-ons-col>
            </v-ons-row>
            <v-ons-row>
                <v-ons-col class="stats">
                    <div class="record-text">{{records_downloaded}}</div>
                    <span class="status-type-text">Records download</span>
                </v-ons-col>
                <v-ons-col class="stats">
                    <div class="record-text">{{records_to_sync}}</div>
                    <span class="status-type-text">Records Edited</span>
                </v-ons-col>
            </v-ons-row>
        </div>
    </div>
            </v-ons-page>
</template>

<script>

export default {
    name: 'ProjectSummaryPage',
    props: ['project', 'pageActive'],
    data() {
        return {};
    },
    computed: {
        records_to_sync() {
            return this.$store.getters.resourcesToSync;
        },
        records_downloaded() {
            var resources = {};
            this.$store.getters.tiles.forEach(function(tile) {
                resources[tile.resourceinstance_id] = null;
            });
            return Object.keys(resources).length;
        }
    },
    methods: {
    },
    mounted() {
        var self = this;
        this.$store.dispatch('getProjectChanges', this.project.id)
            .finally(function(doc) {
                self.changes = doc;
            });
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .description {
        height: 190px;
        background: #fff;
    }

    .section.description {
        padding: 10px 15px;
    }

    .description-label {
        font-size: 15px;
        color: #271F4C;
    }

    .description-text {
        padding-top: 5px;
        font-size: 15px;
        color: #aaa;
    }

    .summary {
        height: 180px;
        background: #fcfcfc;
    }

    .section.summary {
        padding: 30px 15px 15px 15px;
    }

    .stats {
        padding-top: 30px;
    }

    .time-text {
        font-size: 24px;
        color: #999;
        font-weight: 400;
    }
    .date-text {
        font-size: 32px;
        font-weight: 300;
        color: #999;
        padding-bottom: 4px;
    }

    .status-type-text {
        font-size: 14px;
        margin-top: 3px;
        color: #271F4C;
    }

    .record-text {
        font-size: 32px;
        font-weight: 300;
        color: #999;
        padding-bottom: 4px;
    }

    .section {
        border-bottom: solid 1px #c5c5c5;
        padding: 20px;
    }
    ons-progress-circular {
        display: block;
        margin: 20% auto;
    }
    .popup-content {
        margin: 12px 6px 4px;
        color: dimgrey;
        max-width: 170px;
    }
    .popup-content .description {
        font-size: 0.8em;
        line-height: 1.2em;
        margin: 2px;
    }
</style>
