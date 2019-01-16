<template>
    <v-ons-page>
        <page-header></page-header>
        <slot></slot>
    </v-ons-page>
</template>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.list-item .ons-icon {
    font-size: 30px;
}

.left-button-text{
    color: white;
}

.input {
    background-color: whitesmoke;
    padding-left: 10px;
    margin: 10px 0;
}

.toolbar-header {
    background-color: #413040;
    align-items: center;
}


.toolbar-header-icon {
    vertical-align: middle;
}

.application-list {
    background: #4E394C;
    color: #fff;
}

.application-item-panel {
    border-bottom: 1px solid #413040;
}

.application-list-item {
    color: #fff;
    font-size: 15px;
    padding-left: 10px;
}

.application-list-item-prepanel {
    background: #392B39;
    height: 36px;
    width: 36px;
}

.application-list-item-icon {
    padding-top: 6px;
    padding-left: 8px;
    color: #A0B193;
}

.application-list-item-url {
    font-size: 12px;
    color: #aaa;
}

.add-application-icon {
    padding-top: 6px;
    padding-left: 8px;
    color: #fff;
}

.app-details {
    padding: 15px;
}

.app-page-color {
    color: #fff;
    background-color: #4E394C;
    height: 100%;
}

.app-details .server-url {
    color: #ccc;
    font-size: 15px;
}

.app-button-row {
    justify-content: space-evenly;
}

.app-button-col {
    padding: 10px;
}

</style>
