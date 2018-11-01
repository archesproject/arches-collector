import * as components from './components';

export default [
    {
        path: '/project/:tabIndex',
        component: components.ProjectPage,
        name: 'project',
        props: true
    },
    {
        path: '/project/:id',
        component: components.SelectResourceInstancePage,
        name: 'select-resource-instance-page',
        props: true
    }
];
