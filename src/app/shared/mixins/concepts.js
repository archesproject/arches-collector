export default {
    data() {
        return {
        };
    },
    methods: {
    },
    computed: {
        conceptLabels: {
            get: function() {
                var self = this;
                if (Array.isArray(self.value)) {
                    return self.value.map(function(val) {
                        return self.options.find(function(option) {
                            return option.value === val;
                        });
                    });
                } else {
                    return "";
                }
            }
        },
        conceptLabel: {
            get: function() {
                var self = this;
                if (self.value) {
                    return this.options.find(function(val) {
                        return val.value === self.value;
                    });
                } else {
                    return '';
                }
            }
        }
    }
};
