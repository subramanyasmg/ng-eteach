import { Routes } from '@angular/router';
import { GradeDetailsComponent } from './grade-details/grade-details.component';
import { SchoolGradesComponent } from './school-grades/school-grades.component';
import { SchoolStructureComponent } from './school-structure.component';

export default [
    {
        path: '',
        component: SchoolStructureComponent,
        children: [
            {
                path: '',
                component: SchoolGradesComponent,
            },
            {
                path: ':id/:name/sections',
                component: GradeDetailsComponent,
            },
        ],
    },
] as Routes;
