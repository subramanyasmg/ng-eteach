import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { ChaptersService } from 'app/services/chapters.service';
import { ChaptersComponent } from '../chapters/chapters.component';
import { GradesComponent } from '../grades/grades.component';
import { SubjectsComponent } from '../subjects/subjects.component';
import { CurriculumComponent } from './curriculum.component';

export default [
    {
        path: '',
        component: CurriculumComponent,
        children: [
            {
                path: '',
                component: GradesComponent,
            },
            {
                path: ':id/:name/subjects',
                component: SubjectsComponent,
            },
            {
                path: ':id/:gname/subjects/:sid/:sname/chapters',
                component: ChaptersComponent,
                resolve: {
                    phases: () => inject(ChaptersService).getPhases(),
                },
            },
        ],
    },
] as Routes;
