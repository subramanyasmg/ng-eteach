import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { ChaptersService } from 'app/services/chapters.service';
import { CurriculumComponent } from './curriculum.component';
import { CurriculumListComponent } from '../curriculum-list.component';
import { GradesListComponent } from '../../grades/grades.component';
import { SubjectsListComponent } from '../../subjects/subjects.component';
import { ChaptersListComponent } from '../../chapters/chapters.component';

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
                path: ':cid/grades',
                component: GradesListComponent,
            },
            {
                path: ':cid/grades/:gid/subjects',
                component: SubjectsListComponent
            },
            {
                path: ':cid/grades/:gid/subjects/:sid/chapters',
                component: ChaptersListComponent,
                resolve: {
                    phases: () => inject(ChaptersService).getPhases()
                }
            },
        ],
    },
] as Routes;
