<template>
    <v-ons-splitter>
        <v-ons-splitter-side
            swipeable width="150px" collapse="" side="left"
            :open.sync="openSide">
            <v-ons-page>
                <v-ons-list>
                    <v-ons-list-item>
                        <div class="center">Applications</div>
                    </v-ons-list-item>
                </v-ons-list>
            </v-ons-page>
        </v-ons-splitter-side>

        <v-ons-splitter-content>
            <page-header v-on:toggleOpenEvt="toggleOpen"></page-header> 
            <slot></slot>
        </v-ons-splitter-content>
    </v-ons-splitter>
</template>

<script>
export default {
    name: 'PageHeaderLayout',
    props: ['active-server'],
    data() {
        return {
            openSide: false
        }
    },
    methods: {
        toggleOpen: function() {
            this.openSide = !this.openSide;
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.left-button-text{
    color: black;
    position: relative;
    top: -1px;
}

.left-button-offset{
    padding-top:2px;
}

</style>
