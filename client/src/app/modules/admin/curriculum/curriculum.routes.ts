import { Routes } from '@angular/router';
import { CurriculumComponent } from './curriculum.component';
import { GradesComponent } from '../grades/grades.component';
import { CurriculumListComponent } from './curriculum-list/curriculum-list.component';

export default [
    {
        path: '',
        component: CurriculumComponent,
        children: [
            {
                path: '',
                component: CurriculumListComponent
            },
            {
                path: ':id/grades',
                component: GradesComponent
            },
        ],
    },
] as Routes;
