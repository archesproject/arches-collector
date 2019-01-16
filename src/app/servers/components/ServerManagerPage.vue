<template>
    <v-ons-page>
        <div class="body">
            <v-ons-toolbar>
                <div class="left">
                    <span class="left-button-text">{{server.url}}</span>
                </div>
            </v-ons-toolbar>

            <v-ons-input class="input" placeholder="My Arches Application URL" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" float v-model="server.url">
            </v-ons-input>

            <v-ons-input class="input" placeholder="Nickname" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" float v-model="server.nickname">
            </v-ons-input>

            <v-ons-input class="input" placeholder="Username" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" float v-model="server.username">
            </v-ons-input>

            <v-ons-input class="input" placeholder="Password" type="password" float v-model="server.password">
            </v-ons-input>

            <v-ons-list-item v-if="error">
                <div class="left">
                    <v-ons-icon icon="exclamation-triangle" class="list-item__icon" style="color:#ea8a0b;"></v-ons-icon>
                </div>
                <div class="center">{{error_message}}</div>
            </v-ons-list-item>

            <v-ons-button modifier="large" :disabled="disableSignIn" class="btn-success" v-on:click="login">Sign In</v-ons-button>
            <v-ons-button modifier="large quiet" class="btn-danger" style="margin-top: 10px;" v-on:click="cancel">Cancel</v-ons-button>

        </div>
    </v-ons-page>
</template>

<script>

export default {
    name: 'ServerManager',
    data() {
        return {
            server: {
                url: 'http://localhost:8000',
                nickname: 'test',
                username: 'admin',
                password: 'admin',
                token: '',
                refresh_token: '',
                client_id: '',
                active_project: '',
                projects: {},
                user: {}
            },
            error: false,
            error_message: '',
            default_error_message: 'Oops, something happened, maybe you\re offline?'
        };
    },
    computed: {
        disableSignIn: function() {
            return !this.server.url || !this.server.nickname || !this.server.username || !this.server.password;
        }
    },
    methods: {
        cancel: function() {
            this.$router.back();
        },
        login: function() {
            var self = this;
            this.$store.dispatch('getClientId', this.server)
            .then(function(response){
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
            .then(function(response){
                self.server.client_id = response.clientid;
                self.server.user = response.user;
                return self.$store.dispatch('getToken', self.server)
                
            })
            .then(function(response){
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
                self.server.token = response.access_token;
                self.server.refresh_token = response.refresh_token;
                self.$store.commit('addNewServer', self.server);
                self.$router.push({'name': 'projectlist'});
                return self.server;
            })
            .then(function(response) {
                return self.$store.dispatch('getRemoteProjects', self.$store.getters.activeServer);
            })
            .catch(function(error) {
                // console.log('Error:', error);
                self.error = true;
            });
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
    padding-left: 15px;
    font-size: 22px;
    color: dimgrey;
}

.input{
    width: 80%;
    padding: 4px 0;
    margin: 20px 0;
}

</style>
