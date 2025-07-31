/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const superAdmin: FuseNavigationItem[] = [
    {
        id   : 'platform',
        title: 'navigation.platform',
        type : 'group',
        children: [
            {
                id: 'dashboards',
                title: 'navigation.dashboard',
                type: 'basic',
               icon : 'mat_outline:grid_view',
                link: '/admin/dashboard',
            }
        ],
    },
    {
        id   : 'users',
        title: 'navigation.users',
        type : 'group',
        children: [
            {
                id: 'institute',
                title: 'navigation.manageInstitute',
                type: 'basic',
                icon : 'heroicons_outline:academic-cap',
                link: '/admin/manage-institute',
            },
            {
                id: 'subscriptions',
                title: 'navigation.subscriptions',
                type: 'basic',
               icon : 'heroicons_outline:ticket',
                link: '/admin/subscriptions',
            }
        ],
    },
    {
        id   : 'curriculum',
        title: 'navigation.curriculum',
        type : 'group',
        children: [
            {
                id: 'publishers',
                title: 'navigation.managePublishers',
                type: 'basic',
                icon : 'heroicons_outline:book-open',
                link: '/admin/manage-publishers',
            }
            // {
            //     id: 'curriculum',
            //     title: 'navigation.manageCurriculum',
            //     type: 'basic',
            //    icon : 'heroicons_outline:book-open',
            //     link: '/curriculum',
            // }
        ],
    }
];

export const publisher: FuseNavigationItem[] = [
    {
        id   : 'platform',
        title: 'navigation.platform',
        type : 'group',
        children: [
            {
                id: 'dashboards',
                title: 'navigation.dashboard',
                type: 'basic',
               icon : 'mat_outline:grid_view',
                link: '/admin/dashboard',
            }
        ],
    },
    {
        id   : 'users',
        title: 'navigation.users',
        type : 'group',
        children: [
            {
                id: 'institute',
                title: 'navigation.manageInstitute',
                type: 'basic',
                icon : 'heroicons_outline:academic-cap',
                link: '/admin/manage-institute',
            },
            {
                id: 'subscriptions',
                title: 'navigation.subscriptions',
                type: 'basic',
               icon : 'heroicons_outline:ticket',
                link: '/admin/subscriptions',
            }
        ],
    },
    {
        id   : 'curriculum',
        title: 'navigation.curriculum',
        type : 'group',
        children: [
            {
                id: 'curriculum',
                title: 'navigation.manageCurriculum',
                type: 'basic',
               icon : 'heroicons_outline:book-open',
                link: '/admin/manage-curriculum',
            }
        ],
    }
];

export const instituteAdmin: FuseNavigationItem[] = [
    {
        id   : 'platform',
        title: 'navigation.platform',
        type : 'group',
        children: [
            {
                id: 'dashboards',
                title: 'navigation.dashboard',
                type: 'basic',
               icon : 'mat_outline:grid_view',
                link: '/dashboard',
            }
        ],
    },
    {
        id   : 'users',
        title: 'navigation.users',
        type : 'group',
        children: [
            {
                id: 'institute',
                title: 'navigation.manageTeachers',
                type: 'basic',
                icon : 'heroicons_outline:academic-cap',
                link: '/teachers',
            },
            {
                id: 'subscriptions',
                title: 'navigation.subscriptions',
                type: 'basic',
               icon : 'heroicons_outline:ticket',
                link: '/subscriptions',
            }
        ],
    },
    {
        id   : 'curriculum',
        title: 'navigation.curriculum',
        type : 'group',
        children: [
            {
                id: 'curriculum',
                title: 'navigation.manageCurriculum',
                type: 'basic',
               icon : 'heroicons_outline:book-open',
                link: '/curriculum',
            },
            {
                id: 'school',
                title: 'navigation.schoolStructure',
                type: 'basic',
               icon : 'heroicons_outline:wrench-screwdriver',
                link: '/school-structure',
            }
        ],
    }
];


export const teacher: FuseNavigationItem[] = [
    {
        id   : 'platform',
        title: 'navigation.platform',
        type : 'group',
        children: [
            {
                id: 'dashboards',
                title: 'navigation.dashboard',
                type: 'basic',
               icon : 'mat_outline:grid_view',
                link: '/my-dashboard',
            }
        ],
    },
    {
        id   : 'classes',
        title: 'navigation.curriculum',
        type : 'group',
        children: [
            {
                id: 'curriculum',
                title: 'navigation.manageClasses',
                type: 'basic',
               icon : 'heroicons_outline:book-open',
                link: '/manage-classes',
            }
        ],
    }
];
