<template>
    <div class="widget-panel" v-if="context=='editor'">
        <span class="editor widget-label">{{widget.label}}</span>
        <toggle-button id="changed-font" style="float: right" :value="bool_value" :width="width"
               :labels="{'checked': node.config.trueLabel, 'unchecked': node.config.falseLabel}"
                 @input="onChange"/>

        <div id="textWidthElement"></div>
    </div>
    <div class="report-widget" v-else-if="context=='report'">
        <div class="report widget-label">{{widget.label}}</div>
        <div class="report widget-value">{{value}}</div>
    </div>
</template>


<script>
var getTextWidth = function(text, fontSize){
    var el = document.getElementById("textWidthElement");
    var textContent = document.createTextNode(text);
    el.innerHTML = '';
    el.appendChild(textContent);
    var width = (el.clientWidth + 30);
    return width;
}
export default {
    name: 'BooleanWidget',
    props: ['value', 'widget', 'context', 'node'],
    data() {
        return {
            'bool_value': (this.value === true || this.value === false) ? this.value : this.widget.config.defaultValue,
            'width': 70
        };
    },
    computed: {
    },
    methods: {
        onChange(value) {
            this.$emit('update:value', value);
        },
        toggleButtonWidth() {
            var f = getTextWidth(this.node.config.falseLabel, 12);
            var t = getTextWidth(this.node.config.trueLabel, 12);
            return f > t ? f : t;
        }
    },
    mounted: function () {
        this.width = this.toggleButtonWidth();
    }
};
</script>

<style scoped>
#textWidthElement {
    position: absolute;
    visibility: hidden;
    height: auto;
    width: auto;
    white-space: nowrap; /* Thanks to Herb Caudill comment */
}

.widget-panel {
    padding-bottom: 25px;
    background: #fbfbfb;
    border-bottom: 1px solid #ddd;
}

.vue-js-switch {
    font-size: 12px;
}
</style>
