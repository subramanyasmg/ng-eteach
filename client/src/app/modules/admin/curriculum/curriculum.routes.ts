import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { CurriculumComponent } from './curriculum.component';
import { GradesComponent } from '../grades/grades.component';
import { CurriculumListComponent } from './curriculum-list/curriculum-list.component';
import { CurriculumService } from './curriculum-list/curriculum.service';

export default [
    {
        path: '',
        component: CurriculumComponent,
        children: [
            {
                path: '',
                component: CurriculumListComponent,
                resolve: {
                    curriculum: () => inject(CurriculumService).getAll(),
                },
            },
            {
                path: ':id/grades',
                component: GradesComponent
            },
        ],
    },
] as Routes;
