import { Routes } from '@angular/router';
import { CurriculumComponent } from './curriculum.component';
import { GradesComponent } from '../grades/grades.component';
import { CurriculumListComponent } from './curriculum-list/curriculum-list.component';

export default [
    {
        path: '',
        component: CurriculumComponent,
        data: { breadcrumb: 'Curriculum' },
        children: [
            {
                path: '',
                component: CurriculumListComponent,
                data: { breadcrumb: 'Manage Curriculum' }
            },
            {
                path: ':id/grades',
                component: GradesComponent
            },
        ],
    },
] as Routes;
