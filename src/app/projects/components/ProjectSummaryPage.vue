<template>
    <div>
        <div class="section" style="height: 90px;">
            <div>
                Description
            </div>
            <div class="description-text" style="padding-top: 5px;">
                {{project.description}}
            </div>
        </div>
        <div class="section">
            <v-ons-row>
                <v-ons-col style="">
                    <div class="date-text">{{project.lastsync.date}}&nbsp;<span class="time-text">{{project.lastsync.time}}</span></div>
                    <span class="status-type-text">Date/Time of Last Sync</span>
                </v-ons-col>
            </v-ons-row>
            <v-ons-row>
                <v-ons-col style="padding-top: 10px; text-align: right;">
                    <div class="record-text">125</div>
                    <span class="status-type-text">Records download</span>
                </v-ons-col>
                <v-ons-col style="padding-top: 10px; text-align: right;">
                    <div class="record-text">30</div>
                    <span class="status-type-text">Records Edited</span>
                </v-ons-col>
                <v-ons-col style="padding-top: 10px; text-align: right;">
                    <div class="record-text">{{records_to_sync}}</div>
                    <span class="status-type-text">To Sync</span>
                </v-ons-col>
            </v-ons-row>
        </div>
    </div>
</template>

<script>

import uuidv4 from 'uuid/v4';

export default {
    name: 'ProjectSummaryPage',
    props: ['project', 'pageActive'],
    data() {
        return {};
    },
    computed: {
        records_to_sync() {
            return this.$store.getters.resourcesToSync;
        }
    },
    methods: {
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
    .description-text {
        padding-top: 5px;
        font-size: 15px;
        color: #aaa;
    }

    .time-text {
        font-size: 24px;
        color: #454545;
        font-weight: 400;
    }
    .date-text {
        font-size: 32px;
        font-weight: 300;
        color: #454545;
    }

    .status-type-text {
        font-size: 15px;
        color: #aaa;
    }

    .record-text {
        font-size: 32px;
        font-weight: 300;
        color: #454545;
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
