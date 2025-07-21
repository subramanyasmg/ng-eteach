import { Routes } from '@angular/router';
import { SubjectsService } from 'app/services/subjects.service';
import { inject } from '@angular/core';
import { ChaptersService } from 'app/services/chapters.service';
import { CurriculumComponent } from './curriculum.component';
import { GradesComponent } from '../grades/grades.component';
import { SubjectsComponent } from '../subjects/subjects.component';
import { ChaptersComponent } from '../chapters/chapters.component';

export default [
    {
        path: '',
        component: CurriculumComponent,
        children: [
            {
                path: '',
                component: GradesComponent
            },
            {
                path: ':id/subjects',
                component: SubjectsComponent,
            },
            {
                path: ':id/subjects/:sid/chapters',
                component: ChaptersComponent,
                resolve: {
                    phases: () => inject(ChaptersService).getPhases()
                }
            }
        ],
    },
] as Routes;
