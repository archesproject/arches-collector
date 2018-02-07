
exports.install = function(Vue, options) {
    // declare global Vue.cordova object
    Vue.cordova = Vue.cordova || {
        deviceready: false
    };

    // Cordova events wrapper
    // this allows us to do stuff like this:
    // Vue.cordova.on("pause", function(){}, this)
    Vue.cordova.on = function(eventName, cb, scope) {
        var self = this;
        if (!scope) {
            scope = self;
        }
        document.addEventListener(eventName, cb.bind(scope), false);
    };

    // let Vue know that deviceready has been triggered
    document.addEventListener('deviceready', function() {
        Vue.cordova.deviceready = true;

        Vue.cordova.navigator = typeof window.navigator !== 'undefined' ? window.navigator : undefined;
        Vue.cordova.console = typeof window.console !== 'undefined' ? window.console : undefined;
        Vue.cordova.cordova = typeof window.cordova !== 'undefined' ? window.cordova : undefined;
        Vue.cordova.device = typeof window.device !== 'undefined' ? window.device : undefined;
        Vue.cordova.FileTransfer = typeof window.FileTransfer !== 'undefined' ? window.FileTransfer : undefined;
        Vue.cordova.Media = typeof window.Media !== 'undefined' ? window.Media : undefined;
        Vue.cordova.StatusBar = typeof window.StatusBar !== 'undefined' ? window.StatusBar : undefined;

        // navigator.camera
        // navigator.compass
        // navigator.accelerometer
        // navigator.contacts
        // navigator.geolocation
        // navigator.globalization
        // navigator.device.capture
        // navigator.connection
        // navigator.vibrate
        // console
        // cordova.file
        // cordova.InAppBrowser.open()
        // device.cordova
        // FileTransfer
        // Media
        // StatusBar
    }, false);
};
