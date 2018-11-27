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
                return self.value.map(function(val) {
                    return self.options.find(function(option) {
                        return option.valueid === val;
                    });
                });
            }
        },
        conceptLabel: {
            get: function() {
                var self = this;
                return this.options.find(function(val) {
                    return val.valueid === self.value;
                });
            }
        }
    }
};
