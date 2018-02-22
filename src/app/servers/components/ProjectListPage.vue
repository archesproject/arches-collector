<template>
    <transition name="slide">
        <page-header-layout>
            <v-ons-pull-hook
              :action="refreshProjectList"
              @changestate="state = $event.state"
            >
                <span v-show="state === 'initial'"> Pull to refresh </span>
                <span v-show="state === 'preaction'"> Release </span>
                <span v-show="state === 'action'"><v-ons-progress-circular indeterminate></v-ons-progress-circular></span>
            </v-ons-pull-hook>
            <v-ons-list>
                <v-ons-list-item modifier="longdivider">
                    <span class="left"><span>Projects</span></span>
                    <span class="right">
                        <v-ons-icon icon="ion-ios-cloud-download-outline"></v-ons-icon>
                    </span>
                </v-ons-list-item>
                <v-ons-list-item tappable modifier="longdivider" v-for="(project, key) in projects" @click="selectProject(project);">
                    <span>
                        <v-ons-icon icon="ion-android-checkbox-outline"></v-ons-icon>
                        {{project.name}}<br>
                        <span style="font-size: 12px;">{{project.status}}</span>
                    </span>
                </v-ons-list-item>
            </v-ons-list>
        </page-header-layout>
    </transition>
</template>

<script>
export default {
    name: 'ProjectList',
    data() {
        return {
            state: 'initial'
        };
    },
    computed: {
        projects() {
            return this.$store.getters.currentProjects;
        }
    },
    methods: {
        selectProject(project) {
            var payload = {
                project_id: project.id
            };
            this.$store.commit('setActiveProject', payload);
            this.$router.push({'name': 'project', params: { id: project.id }});
        },
        refreshProjectList(done) {
            this.$store.dispatch('getRemoteProjects', this.$store.getters.activeServer.url)
            .finally(function() {
                done();
            });
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


</style>
