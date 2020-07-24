export default {
    data() {
        return {
        };
    },
    methods: {
        makeFriendly(ontolgoyName) {
            /**
            * makeFriendly - makes a shortened name from an fully qalified name
            * (eg: "http://www.cidoc-crm.org/cidoc-crm/E74_Group")
            *
            * @param  {ontolgoyName} the request method name
            * @return {string}
            */
            if (!!ontolgoyName) {
                var parts = ontolgoyName.split('/');
                return parts[parts.length - 1];
            }
            return '';
        }
    },
    computed: {
    }
};
