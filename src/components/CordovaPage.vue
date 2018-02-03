<script>
/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

export default {
    name: 'cordova',
    template: '<div></div>',
    data() {
        return {
            ready: this.$store.state.cordova.deviceready
        }
    },
    computed: {
        deviceready() {
            return this.$store.state.cordova.deviceready;
        }
    },
    //ready: false,
    // Application Constructor
    initialize: function(store) {
        this.$store = store;
        console.log(this.ready);
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        this.ready = true;
        console.log(this.ready);
        return this.ready;
        //this.$store.state.cordova.commit('deviceready', this.ready);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.ready = true;
        console.log(this.ready);
        this.$store.commit('deviceready', this.ready);
        //this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};
</script>