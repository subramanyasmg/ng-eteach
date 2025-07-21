import { Routes } from '@angular/router';
import { SchoolStructureComponent } from './school-structure.component';
import { SchoolGradesComponent } from './school-grades/school-grades.component';
import { GradeDetailsComponent } from './grade-details/grade-details.component';

export default [
    {
        path: '',
        component: SchoolStructureComponent,
        children: [
            {
                path: '',
                component: SchoolGradesComponent
            },
            {
                path: ':id/sections',
                component: GradeDetailsComponent,
            }
        ],
    },
] as Routes;
