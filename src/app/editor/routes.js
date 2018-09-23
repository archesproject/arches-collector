import * as components from './components';

export default [
    {
        path: '/resource/:id',
        component: components.ResourcePage,
        name: 'resource',
        props: true
    }
];
