<template>
    <page-header-layout>
        <v-ons-page>
            <v-ons-toolbar style="background-color: whitesmoke;">
                <div class="left">
                    <v-ons-toolbar-button>
                        <v-ons-icon class="text-color-dark resource-header" icon="ion-android-arrow-dropleft-circle" @click="back"></v-ons-icon>
                        <span class="text-color-dark resource-header">{{current_card.name}}</span>
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
                                    <resource-edit-page :nodegroupid="current_nodegroup_id" v-on:navigate-to-card="navigateToCard" v-on:show-form="showForm" />
                                </v-ons-carousel-item>
                                <v-ons-carousel-item class="page-background">
                                    <resource-tree-page :project="project"/>
                                </v-ons-carousel-item>
                                <v-ons-carousel-item class="page-background">
                                    <resource-edit-form :nodegroupid="current_nodegroup_id"/>
                                </v-ons-carousel-item>
                            </v-ons-carousel>
                            <div class="navbar">
                                <a v-bind:class="carouselIndex === 0 ? 'active' : ''" @click="carouselIndex = 0">
                                    <v-ons-icon class="text-color-dark icon" icon="fa-check-circle"></v-ons-icon>
                                    <div class="text-color-dark label">Resource</div>
                                </a>
                                <a v-bind:class="carouselIndex === 1 ? 'active' : ''" @click="carouselIndex = 1">
                                    <v-ons-icon class="text-color-dark icon" icon="fa-sitemap"></v-ons-icon>
                                    <div class="text-color-dark label">Overview</div>
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
    props: ['nodegroupid'],
    data() {
        return {
            carouselIndex: 0,
            project: this.$store.getters.activeProject
        };
    },
    computed: {
        current_nodegroup_id: function() {
            return this.$store.getters.activeServer.card_nav_stack[0];
        },
        current_card: function() {
            var allcards = this.$store.getters.activeGraph.cards;
            var card = this.$underscore.find(allcards, function(card) {
                return card.nodegroup_id === this.current_nodegroup_id;
            }, this);
            if (card) {
                return card;
            } else {
                return this.$store.getters.activeGraph;
            }
        }
    },
    methods: {
        navigateToCard: function(card) {
            console.log(card);
            this.$store.getters.activeServer.card_nav_stack.unshift(card.nodegroup_id);
            this.nodegroup_id = card.nodegroup_id;
        },
        back: function() {
            if (this.$store.getters.activeServer.card_nav_stack.length === 1) {
                this.$router.push({
                    'name': 'project',
                    params: {
                        'project': this.project,
                        'carouselIndex': 0
                    }
                });
            }
            if (this.carouselIndex === 2){
                this.carouselIndex = 0;
            }else{
                this.$store.getters.activeServer.card_nav_stack.shift();  
            }
        },
        showForm: function() {
            this.carouselIndex = 2;
        }
    },
    mounted: function() {
        console.log('mounted');
        this.$store.getters.activeServer.card_nav_stack = [];
        this.$store.getters.activeServer.card_nav_stack.unshift(this.nodegroupid);
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

.resource-header {
    font-size: 18px;
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

.navbar a.active {
    background-color: white;
    color: white;
}
</style>