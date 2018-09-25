<template>
    <page-header-layout>
        <v-ons-page>
            <v-ons-toolbar style="background-color: whitesmoke;">
                <div class="left">
                    <v-ons-toolbar-button>
                        <router-link :to="{ name: 'project', params: { project: this.project, carouselIndex: 0 } }"><v-ons-icon class="text-color-dark project-header" icon="ion-android-arrow-dropleft-circle"></v-ons-icon></router-link>
                    </v-ons-toolbar-button>
                </div>
                <div class="center"></div>
            </v-ons-toolbar>
            <v-ons-splitter>
                <v-ons-splitter-content>
                    <v-ons-page>
                        <div>
                            <v-ons-carousel fullscreen swipeable auto-scroll overscrollable :index.sync="carouselIndex" id="resourceCarousel">
                                <v-ons-carousel-item class="page-background">
                                    <resource-edit-page ref="sripage"/>
                                </v-ons-carousel-item>
                            </v-ons-carousel>
                            <div class="navbar">
                                <a v-bind:class="carouselIndex === 0 ? 'active' : ''" @click="carouselIndex = 0">
                                    <v-ons-icon class="text-color-dark icon" icon="fa-check-circle"></v-ons-icon>
                                    <div class="text-color-dark label">Resource</div>
                                </a>
                            </div>
                        </div>
                    </v-ons-page>
                </v-ons-splitter-content>
            </v-ons-splitter>
        </v-ons-page>
    </page-header-layout>
</template>


<script>
export default {
    name: 'ResourcePage',
    //props: [],
    data() {
        return {
            carouselIndex: 0,
            project: this.$store.getters.activeProject,
            resourceid: this.$store.getters.activeServer.active_resource
        };
    },
    methods: {
        save: function(tile) {
            console.log('saving...');
            this.$store.dispatch('persistTile', tile)
                .then(function(doc) {
                    return doc;
                })
                .finally(function() {
                    console.log('tile save finished...');
                });
            this.$store.dispatch(
                'getResource', {
                    projectid: this.project.id,
                    resourceid: this.$store.getters.activeServer.active_resource
                }
            ).then((res) => {
                var resource = res['docs'][0];
                var date = new Date();
                resource['edited'] = {'day': date.toDateString(), 'time': date.toTimeString()};
                this.$store.dispatch('persistResource', resource)
                    .then(function(doc) {
                        return doc;
                    })
                    .finally(function() {
                        console.log('resource save finished...');
                    });
            });
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.page-background {
    background-color: white;
}

.padded-page.map-page > ons-page {
    margin-bottom: 60px;
}

.cover {
    width: 100%;
    background-color: gray;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    opacity: .2;
    display: none;
}

/* Place the navbar at the bottom of the page, and make it stick */

.navbar {
    background-color: #f5f5f5;
    overflow: hidden;
    position: fixed;
    bottom: 0;
    width: 100%;
    padding: 0;
    margin: 0;
    list-style: none;
    display: -webkit-box;
    display: -moz-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-flow: row wrap;
    justify-content: space-around;
}


/* Style the links inside the navigation bar */

.navbar a {
    float: left;
    display: block;
    color: #f2f2f2;
    text-align: center;
    padding: 14px 0px;
    text-decoration: none;
    font-size: 17px;
    width: 33%;
    flex-grow: 1;
}

.navbar .icon {
    font-size: 14px !important;
    font-family: FontAwesome5;
}

.navbar .label {
    font-size: 12px !important;
}

</style>
