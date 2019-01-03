<template>
    <div v-if="context=='editor'">
        <div class="editor widget-label">{{widget.label}}</div>
        <input :value="value" :placeholder="placeholder" @input="$emit('update:value', $event.target.value);">
    </div>
    <ons-row class="report-widget" v-else-if="context=='report'">
        <ons-col
          <span class="report widget-label">{{widget.label}}</span>
          <span class="report widget-value">{{value}}</span>
        </ons-col>
    </ons-row>
</template>


<script>
export default {
    name: 'StringWidget',
    props: ['value', 'widget', 'context'],
    data() {
        return {
            placeholder: this.widget.config.placeholder
        };
    },
    methods: {
    },
    computed: {
    }
};
</script>

<style scoped>
.widget-value {

}

.widget-label {
  font-weight: 600;
  color: #271F4C;
  padding-right: 5px;
}
</style>
