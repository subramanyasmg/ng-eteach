import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { PrivilegeGuard } from './core/auth/guards/privilege.guard';
import { USER_TYPES } from './constants/usertypes';
import { SuperadminGuard } from './core/auth/guards/superadmin.guard';
import { TenantGuard } from './core/auth/guards/tenant.guard';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    {path: '', pathMatch : 'full', redirectTo: 'home'},

    // Redirect signed-in user to the '/example'
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. Below is another redirection for that path to redirect the user to the desired
    // location. This is a small convenience to keep all main routes together here on this file.
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: '/admin/dashboard'},
    {path: 'institute-admin-signed-in-redirect', pathMatch: 'full', redirectTo: '/dashboard'},
    {path: 'teacher-signed-in-redirect', pathMatch: 'full', redirectTo: '/my-dashboard'},

    // Auth routes for admin portal
    {
        path: 'admin',
        canActivate: [SuperadminGuard, NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: '', pathMatch: 'full', redirectTo: 'sign-in'},
            {path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes')},
            {path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes')},
            {path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes')},
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes')},
            {path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.routes')}
        ]
    },
    // Auth routes for institute admin portal
    {
        path: '',
        canActivate: [TenantGuard, NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/institute-admin/sign-in/sign-in.routes')},
            {path: 'verify-email', loadChildren: () => import('app/modules/auth/institute-admin/create-password/create-password.routes')},
        ]
    },
    {
        path: 'create-password-success',
        loadChildren: () =>
            import('app/modules/auth/institute-admin/create-password-success/create-password-success.routes'),
    },

     // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes')},
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes')},
            {path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes')}
        ]
    },

    // Admin routes
    {
        path: 'admin',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {path: 'dashboard', canActivate: [PrivilegeGuard],  data: { userType: [USER_TYPES.SUPER_ADMIN, USER_TYPES.PUBLISHER_ADMIN, USER_TYPES.PUBLISHER_USER] },loadChildren: () => import('app/modules/superadmin/dashboard/dashboard.routes')},
            {path: 'manage-publishers',  canActivate: [PrivilegeGuard],  data: { userType: [USER_TYPES.SUPER_ADMIN] }, loadChildren: () => import('app/modules/superadmin/publishers/publishers.routes')},
            {path: 'manage-institute',  canActivate: [PrivilegeGuard],  data: { userType: [USER_TYPES.SUPER_ADMIN, USER_TYPES.PUBLISHER_ADMIN]}, loadChildren: () => import('app/modules/superadmin/institutes/institutes.routes')},
            {path: 'manage-curriculum',  canActivate: [PrivilegeGuard],  data: { userType: [USER_TYPES.PUBLISHER_ADMIN, USER_TYPES.PUBLISHER_USER] }, loadChildren: () => import('app/modules/superadmin/curriculum/curriculum/curriculum.routes')},
            {path: 'dashboard', canActivate: [PrivilegeGuard],  data: { userType: [USER_TYPES.SUPER_ADMIN, USER_TYPES.PUBLISHER_ADMIN, USER_TYPES.PUBLISHER_USER] },loadChildren: () => import('app/modules/superadmin/dashboard/dashboard.routes')},
            {path: 'edit-profile', loadChildren: () => import('app/modules/auth/edit-profile/edit-profile.routes')}
        ]
    },
    // Institute Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {path: 'dashboard',  canActivate: [PrivilegeGuard],  data: { userType: [USER_TYPES.INSTITUTE_ADMIN] }, loadChildren: () => import('app/modules/instituteadmin/dashboard/dashboard.routes')},
            {path: 'teachers',  canActivate: [PrivilegeGuard],  data: { userType: [USER_TYPES.INSTITUTE_ADMIN] }, loadChildren: () => import('app/modules/instituteadmin/teachers/teachers.routes')},
            {path: 'curriculum',  canActivate: [PrivilegeGuard],  data: { userType: [USER_TYPES.INSTITUTE_ADMIN] }, loadChildren: () => import('app/modules/instituteadmin/curriculum/curriculum.routes')},
            {path: 'school-structure',  canActivate: [PrivilegeGuard],  data: { userType: [USER_TYPES.INSTITUTE_ADMIN] }, loadChildren: () => import('app/modules/instituteadmin/school-structure/school-structure.routes')},
            {path: 'edit-profile', loadChildren: () => import('app/modules/auth/edit-profile/edit-profile.routes')}
        ]
    },
    // Institute Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {path: 'my-dashboard',  canActivate: [PrivilegeGuard],  data: { userType: [USER_TYPES.TEACHER] }, loadChildren: () => import('app/modules/teacher/dashboard/dashboard.routes')},
            {path: 'manage-classes',  canActivate: [PrivilegeGuard],  data: { userType: [USER_TYPES.TEACHER] }, loadChildren: () => import('app/modules/teacher/manage-classes/manage-classes.routes')}
        ]
    },
    {
        path: 'unauthorized',
        loadChildren: () =>
            import('app/modules/auth/not-authorized/not-authorized.routes'),
    },
    {path: '404-not-found', pathMatch: 'full', loadChildren: () => import('app/modules/error/error-404/error-404.routes')},
    {path: '**', redirectTo: '404-not-found'}
];
