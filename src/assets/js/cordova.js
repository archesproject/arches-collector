
// export default {
//         ready: false,
//         // Application Constructor
//         initialize: function() {
//                 console.log(this.ready);
//                 document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
//                 this.$store.state.cordova.commit('deviceready', this.ready);
//         },

//         // deviceready Event Handler
//         //
//         // Bind any cordova events here. Common events are:
//         // 'pause', 'resume', etc.
//         onDeviceReady: function() {
//                 this.ready = true;
//                 console.log(this.ready);
//                 this.$store.state.cordova.commit('deviceready', this.ready);
//                 //this.receivedEvent('deviceready');
//         },

//         // Update DOM on a Received Event
//         receivedEvent: function(id) {
//                 var parentElement = document.getElementById(id);
//                 var listeningElement = parentElement.querySelector('.listening');
//                 var receivedElement = parentElement.querySelector('.received');

//                 listeningElement.setAttribute('style', 'display:none;');
//                 receivedElement.setAttribute('style', 'display:block;');

//                 console.log('Received Event: ' + id);
//         }
// };


exports.install = function(Vue, options) {
    // declare global Vue.cordova object
    Vue.cordova = Vue.cordova || {
        deviceready: false
    }

    // Cordova events wrapper
    // this allows us to do stuff like this:
    // Vue.cordova.on("pause", function(){}, this)
    Vue.cordova.on = function(eventName, cb, scope){
        var self = this;
        if (!scope){
            scope = self;
        }
        document.addEventListener(eventName, cb.bind(scope), false);
    }

    // let Vue know that deviceready has been triggered
    document.addEventListener('deviceready', function(){
        Vue.cordova.deviceready = true;

        Vue.cordova.navigator = typeof navigator !== 'undefined' ? navigator : undefined;
        Vue.cordova.console = typeof console !== 'undefined' ? console : undefined;
        Vue.cordova.cordova = typeof cordova !== 'undefined' ? cordova : undefined;
        Vue.cordova.device = typeof device !== 'undefined' ? device : undefined;
        Vue.cordova.FileTransfer = typeof FileTransfer !== 'undefined' ? FileTransfer : undefined;
        Vue.cordova.FileUploadOptions = typeof FileUploadOptions !== 'undefined' ? FileUploadOptions : undefined;
        Vue.cordova.Media = typeof Media !== 'undefined' ? Media : undefined;
        Vue.cordova.StatusBar = typeof StatusBar !== 'undefined' ? StatusBar : undefined;

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
        // FileUploadOptions
        // Media
        // StatusBar

    }, false)

}