import Vue from 'vue';
import Router from 'vue-router';
import server from './app/servers/routes';
import splash from './app/splash/routes';

Vue.use(Router);

console.log([...server, ...splash])
export default new Router({
  mode: 'hash',
  routes: [...server, ...splash]
});
