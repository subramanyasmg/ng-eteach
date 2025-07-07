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
                title: 'navigation.manageInstitute',
                type: 'basic',
                icon : 'heroicons_outline:academic-cap',
                link: '/manage-institute',
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
                link: '/institute/dashboard',
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
                link: '/institute/teachers',
            },
            {
                id: 'subscriptions',
                title: 'navigation.subscriptions',
                type: 'basic',
               icon : 'heroicons_outline:ticket',
                link: '/institute/subscriptions',
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
                link: '/institute/curriculum',
            },
            {
                id: 'school',
                title: 'navigation.schoolStructure',
                type: 'basic',
               icon : 'heroicons_outline:wrench-screwdriver',
                link: '/institute/school',
            }
        ],
    }
];
