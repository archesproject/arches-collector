<template>
    <v-ons-page>
        <v-ons-carousel fullscreen auto-scroll overscrollable
        :index.sync="carouselIndex" :on-swipe="onSwipe">
            <v-ons-carousel-item>
                <div class="body">
               
                    <v-ons-toolbar>      
                        <div class="center left-button-text">Sign In</div>
                    </v-ons-toolbar>

                    <v-ons-input class="input" placeholder="My Arches Application URL" float v-model="server.url">
                    </v-ons-input>
                    <v-ons-input class="input" placeholder="Nickname" float v-model="server.nickname">
                    </v-ons-input>
                                    
                    <v-ons-button modifier="large" :disabled="disableNext" class="btn-success" v-on:click="next">Next</v-ons-button>
                </div>
            </v-ons-carousel-item>
            <v-ons-carousel-item>
                <div class="body">
                    <v-ons-toolbar>
                        <div class="left">
                            <v-ons-toolbar-button class="left-button-text" @click="back">
                                <v-ons-icon icon="ion-android-arrow-back"></v-ons-icon>
                                <span>{{server.url}}</span>
                            </v-ons-toolbar-button>
                        </div>
                    </v-ons-toolbar>

                    <v-ons-input class="input" placeholder="Username" float v-model="server.username">
                    </v-ons-input>
                    <v-ons-input class="input" placeholder="Password" float v-model="server.password">
                    </v-ons-input>

                    <v-ons-list-item v-if="error">
                        <div class="left">
                            <v-ons-icon icon="exclamation-triangle" class="list-item__icon" style="color:#ea8a0b;"></v-ons-icon>
                        </div>
                        <div class="center">{{error_message}}</div>
                    </v-ons-list-item>

                    <v-ons-button modifier="large" :disabled="disableSignIn" class="btn-success" v-on:click="getClientId">Sign In</v-ons-button>
                    <v-ons-button modifier="large quiet" class="btn-danger" style="margin-top: 10px;" v-on:click="cancel">Cancel</v-ons-button>
                </div>
            </v-ons-carousel-item>
        </v-ons-carousel>
    </v-ons-page>
</template>

<script>

export default {
    name: 'ServerManager',
    // props: ['index'],
    data() {
        return {
            carouselIndex: 0,
            server: {
                url: 'http://localhost:8000',
                nickname: 'test',
                username: 'admin',
                password: 'admin',
                token: '',
                refresh_token: '',
                client_id: '',
                active_project: '',
                projects: {}
            },
            error: false,
            error_message: '',
            default_error_message: 'Oops, something happened, maybe you\re offline?'
        };
    },
    computed: {
        disableNext: function() {
            return !this.server.url || !this.server.nickname;
        },
        disableSignIn: function() {
            return !this.server.url || !this.server.nickname || !this.server.username || !this.server.password;
        }
    },
    methods: {
        next: function() {
            this.carouselIndex = 1;
        },
        back: function() {
            this.carouselIndex = 0;
        },
        cancel: function() {
            this.$router.back();
        },
        getClientId: function() {
            var self = this;
            self.error = false;

            var formData = new FormData();
            formData.append('username', this.server.username);
            formData.append('password', this.server.password);
            this.server.url = this.server.url.replace(/\/$/, '');

            fetch(this.server.url.replace(/\/$/, '') + '/auth/get_client_id', {
                method: 'POST',
                body: formData,
                headers: new Headers({
                    // 'Content-Type': 'text/plain'
                    // 'Content-Type': 'application/x-www-form-urlencoded'
                })
            })
                .then(function(response) {
                    // return the response object or throw an error
                    // console.log(response);
                    if (response.ok) {
                        return response.text();
                    } else {
                        if (response.status === 401) {
                            self.error_message = 'The supplied username or password was not valid.';
                        } else {
                            self.error_message = self.default_error_message;
                        }
                    }

                    throw new Error('Network response was not ok.');
                })
                .then(function(response) {
                    // console.log('Success:', response);
                    self.server.client_id = response;
                    self.getToken();
                })
                .catch(function(error) {
                    // console.log('Error:', error);
                    self.error = true;
                });
        },
        getToken: function() {
            var self = this;
            self.error = false;

            var formData = new FormData();
            formData.append('username', this.server.username);
            formData.append('password', this.server.password);
            formData.append('grant_type', 'password');
            formData.append('client_id', this.server.client_id);
            this.server.url = this.server.url.replace(/\/$/, '');

            fetch(this.server.url.replace(/\/$/, '') + '/o/token/', {
                method: 'POST',
                body: formData,
                headers: new Headers({
                    // 'Content-Type': 'text/plain'
                    // 'Content-Type': 'application/x-www-form-urlencoded'
                })
            })
                .then(function(response) {
                    // return the response object or throw an error
                    // console.log(response);
                    if (response.ok) {
                        return response.json();
                    } else {
                        if (response.status === 401) {
                            self.error_message = 'The supplied username or password was not valid.';
                        } else {
                            self.error_message = self.default_error_message;
                        }
                    }

                    throw new Error('Network response was not ok.');
                })
                .then(function(response) {
                    // console.log('Success:', response);
                    self.server.token = response.access_token;
                    self.server.refresh_token = response.refresh_token;
                    self.$store.commit('addNewServer', self.server);
                    self.$router.push({'name': 'projectlist'});
                })
                .catch(function(error) {
                    // console.log('Error:', error);
                    self.error = true;
                });
        },

        onSwipe: function(newIndex) {
            // console.log('swipping');
            // console.log(newIndex);
            if (this.carouselIndex === 0) {
                this.carouselIndex = 0;
            }
        }
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.body{
    padding: 80px 35px;
    font-size: 16px;
    color: dimgrey;
}

.left-button-text {
    font-size: 22px;
    color: dimgrey;
}

.input{
    width: 80%;
    padding: 4px 0;
    margin: 20px 0;
}

</style>
