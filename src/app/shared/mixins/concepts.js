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
                var res = self.value.map(function(val) {
                    return self.options.find(function(option) {
                        return option.valueid === val;
                    });
                });
                console.log(res);
                return res;
            }
        },
        conceptLabel: {
            get: function() {
                var self = this;
                var res = this.options.find(function(val) {
                    return val.valueid === self.value;
                });
                console.log(res);
                return res;
            }
        }
    }
};
