import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { LayoutComponent } from 'app/layout/layout.component';
import { PrivilegeGuard } from './core/auth/guards/privilege.guard';
import { USER_TYPES } from './constants/usertypes';

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
    {path: 'signed-in-redirect', pathMatch : 'full', redirectTo: 'dashboard'},
    {path: 'institute-admin-signed-in-redirect', pathMatch: 'full', redirectTo: '/institute/dashboard'},

    // Auth routes for super admin portal
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes')},
            {path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes')},
            {path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes')},
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes')},
            {path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.routes')}
        ]
    },
    // Auth routes for super admin portal
    {
        path: 'institute',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/institute-admin/sign-in/sign-in.routes')},
            {path: 'create-password', loadChildren: () => import('app/modules/auth/institute-admin/create-password/create-password.routes')},
        ]
    },
    {
        path: 'institute/create-password-success',
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

    // Super Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {path: 'dashboard', canActivate: [PrivilegeGuard],  data: { userType: USER_TYPES.SUPER_ADMIN },loadChildren: () => import('app/modules/superadmin/dashboard/dashboard.routes')},
            // {path: 'curriculum', canActivate: [PrivilegeGuard],  data: { userType: USER_TYPES.SUPER_ADMIN },loadChildren: () => import('app/modules/superadmin/curriculum/curriculum.routes')},
            {path: 'manage-publishers',  canActivate: [PrivilegeGuard],  data: { userType: USER_TYPES.SUPER_ADMIN }, loadChildren: () => import('app/modules/superadmin/publishers/publishers.routes')},
            {path: 'manage-institute',  canActivate: [PrivilegeGuard],  data: { userType: USER_TYPES.SUPER_ADMIN }, loadChildren: () => import('app/modules/superadmin/institutes/institutes.routes')},
        ]
    },
    // Institute Admin routes
    {
        path: 'institute',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {path: 'dashboard',  canActivate: [PrivilegeGuard],  data: { userType: USER_TYPES.INSTITUTE_ADMIN }, loadChildren: () => import('app/modules/instituteadmin/dashboard/dashboard.routes')},
            {path: 'teachers',  canActivate: [PrivilegeGuard],  data: { userType: USER_TYPES.INSTITUTE_ADMIN }, loadChildren: () => import('app/modules/instituteadmin/teachers/teachers.routes')},
        ]
    },
    {
        path: 'unauthorized',
        loadChildren: () =>
            import('app/modules/auth/not-authorized/not-authorized.routes'),
    }
];
