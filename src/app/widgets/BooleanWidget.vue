<template>
    <div class="widget-panel" v-if="context=='editor'">
        <span class="editor widget-label">{{widget.label}}</span>
        <toggle-button id="changed-font" style="float: right" :sync="true" v-model="localValue" :width="width"
               :labels="{'checked': node.config.trueLabel, 'unchecked': node.config.falseLabel}"/>

        <div id="textWidthElement"></div>
    </div>

    <div class="report-widget" v-else-if="context=='report'">
        <div class="report widget-label">{{widget.label}}
            <span class="report widget-value">{{value}}</span>
        </div>
    </div>
    <span class="flex tile-data" v-else-if="context=='nav'">
        <div v-if="!!value">{{value}}</div>
        <div v-else>no data</div>
        <div class="widget-label">{{widget.label}}</div>
    </span>
</template>


<script>
export default {
    name: 'BooleanWidget',
    props: ['value', 'widget', 'context', 'node'],
    data() {
        return {
            'width': 70
        };
    },
    computed: {
        localValue: {
            get: function() {
                return !!this.value;
            },
            set: function(value) {
                this.$emit('update:value', value);
            }
        },
    },
    methods: {
        getTextWidth: function(text, fontSize) {
            var el = document.getElementById("textWidthElement");
            var textContent = document.createTextNode(text);
            el.innerHTML = '';
            el.appendChild(textContent);
            var width = ((text.length*8) + 30);
            return width;
        },
        toggleButtonWidth() {
            var f = this.getTextWidth(this.node.config.trueLabel, 12);
            var t = this.getTextWidth(this.node.config.trueLabel, 12);
            return f > t ? f : t;
        }
    },
    mounted: function () {
        this.$nextTick(function() {
            this.width = this.toggleButtonWidth();
        }, this);
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

.tile-data {
    background: #f9f9f9;
}

.report-widget {
    padding-bottom: 3px;
}

.widget-panel {
    padding-bottom: 25px;
    background: #fbfbfb;
    border-bottom: 1px solid #ddd;
}

.widget-panel.widget {
    padding-bottom: 25px;
}

.vue-js-switch {
    font-size: 12px;
}

.widget-label {
  font-weight: 400;
  color: #271F4C;
  padding-right: 5px;
}

.tile-data {
    background: #fafafa;
    color: #888;
    margin-left: -5px;
    padding-left: 5px;
}s

.tile-data .widget-label {
    color: #271F4C;
    font-size: 13px;
    padding-bottom: 10px;
}
</style>
