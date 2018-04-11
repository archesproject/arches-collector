import Vue from 'vue';
import Router from 'vue-router';
import server from './app/servers/routes';
import splash from './app/splash/routes';
import projects from './app/projects/routes';
import editor from './app/editor/routes';

Vue.use(Router);

export default new Router({
    mode: 'hash',
    routes: [...server, ...splash, ...projects, ...editor]
});
