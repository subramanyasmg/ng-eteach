import { Routes } from '@angular/router';
import { ExampleComponent } from 'app/modules/superadmin/example/example.component';

export default [
    {
        path     : '',
        component: ExampleComponent,
        data: { breadcrumb: 'Home' }
    },
] as Routes;
