import { Routes } from '@angular/router';
import { DashboardComponent } from 'app/modules/superadmin/dashboard/dashboard.component';

export default [
    {
        path     : '',
        component: DashboardComponent,
        data: { breadcrumb: 'Home' }
    },
] as Routes;
