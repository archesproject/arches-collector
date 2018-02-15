<template>
    <transition name="slide">
        <v-ons-page key="0">
            <v-ons-carousel fullscreen auto-scroll overscrollable
            :index.sync="carouselIndex" :on-swipe="onSwipe">
                <v-ons-carousel-item>
                    <div class="body">
                        <div class="title">Sign In</div>

                        <v-ons-input class="input" placeholder="My Arches Application URL" float v-model="server.url">
                        </v-ons-input>
                        <v-ons-input class="input" placeholder="Nickname" float v-model="server.nickname">
                        </v-ons-input>
                                        
                        <v-ons-button modifier="large" :disabled="disableNext" class="btn-success" v-on:click="next">Next</v-ons-button>
                    </div>
                </v-ons-carousel-item>
                <v-ons-carousel-item>
                    <div class="body">
                        <div class="title">{{server.url}}</div>

                        <v-ons-input class="input" placeholder="Username" float v-model="server.username">
                        </v-ons-input>
                        <v-ons-input class="input" placeholder="Password" float v-model="server.password">
                        </v-ons-input>

                        <v-ons-list-item v-if="error">
                            <div class="left">
                                <v-ons-icon icon="exclamation-triangle" class="list-item__icon" style="color:#ea8a0b;"></v-ons-icon>
                            </div>
                            <div class="center">Oops, something happened, maybe you're offline?</div>
                        </v-ons-list-item>

                        <v-ons-button modifier="large" :disabled="disableSignIn" class="btn-success" v-on:click="getToken">Sign In</v-ons-button>
                        <v-ons-button modifier="large quiet" class="btn-danger" style="margin-top: 10px;" v-on:click="cancel">Cancel</v-ons-button>
                    </div>
                </v-ons-carousel-item>
            </v-ons-carousel>

        </v-ons-page>
    </transition>
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
                token: ''
            },
            error: false
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
        cancel: function() {
            this.$router.back();
        },
        getToken: function() {
            var self = this;
            self.error = false;

            var formData = new FormData();
            formData.append('username', this.server.username);
            formData.append('password', this.server.password);

            fetch(this.server.url.replace(/\/$/, '') + '/auth/get_token', {
                method: 'POST',
                body: formData,
                headers: new Headers({
                    // 'Content-Type': 'text/plain'
                    // 'Content-Type': 'application/x-www-form-urlencoded'
                })
            })
            .then(function(response) {
                // return the response object or throw an error
                console.log(response);
                if (response.ok) {
                    return response.text();
                }
                throw new Error('Network response was not ok.');
            })
            .then(function(response) {
                // set the server metadata and token
                console.log('Success:', response);
                self.server.token = response;
                return self.$store.dispatch('upsertAppServer', self.server);
            })
            .then(function(res) {
                console.log('success in upserting a new doc');
                // maybe we need to go to the projects page and load/update the list of projects
                self.$router.push({'name': 'projectlist'});
            })
            .catch(function(error) {
                console.log('Error:', error);
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
    padding: 35px;
    color: dimgrey;
}

.title{
    font-size: 22px;
    padding-bottom: 80px;
}

.input{
    width: 80%;
    padding: 4px 0;
    margin: 20px 0;
}

</style>
