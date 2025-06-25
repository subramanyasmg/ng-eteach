/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id   : 'platform',
        title: 'Platform',
        type : 'group',
        children: [
            {
                id: 'dashboards',
                title: 'Dashboard',
                type: 'basic',
               icon : 'mat_outline:grid_view',
                link: '/dashboard',
            }
        ],
    },
    {
        id   : 'users',
        title: 'Users',
        type : 'group',
        children: [
            {
                id: 'institute',
                title: 'Manage Institute',
                type: 'basic',
                icon : 'heroicons_outline:academic-cap',
                link: '/institute',
            },
            {
                id: 'subscriptions',
                title: 'Subscriptions',
                type: 'basic',
               icon : 'heroicons_outline:ticket',
                link: '/subscriptions',
            }
        ],
    },
    {
        id   : 'curriculum',
        title: 'Curriculum',
        type : 'group',
        children: [
            {
                id: 'curriculum',
                title: 'Manage Curriculum',
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
