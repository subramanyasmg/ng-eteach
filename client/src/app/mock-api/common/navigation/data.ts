/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
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
                link: '/institute',
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
export const compactNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
