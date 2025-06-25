import { Routes } from '@angular/router';
import { GradesListComponent } from '../grades/grades.component';
import { CurriculumListComponent } from './curriculum-list/curriculum-list.component';
import { CurriculumComponent } from './curriculum.component';

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
                component: GradesListComponent
            },
        ],
    },
] as Routes;
