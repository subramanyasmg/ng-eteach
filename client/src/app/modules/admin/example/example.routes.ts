import { Routes } from '@angular/router';
import { ExampleComponent } from 'app/modules/admin/example/example.component';

export default [
    {
        path     : '',
        component: ExampleComponent,
        data: { breadcrumb: 'Home' }
    },
] as Routes;
