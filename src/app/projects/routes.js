import * as components from './components';

export default [
    {
        path: '/project/:id',
        component: components.ProjectPage,
        name: 'project',
        props: true
    },
    {
        path: '/projectmap',
        component: components.ProjectMapPage,
        name: 'projectmap'
    }
];
