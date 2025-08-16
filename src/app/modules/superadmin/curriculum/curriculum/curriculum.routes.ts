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
                path: ':cid/:cname/grades',
                component: GradesListComponent,
            },
            {
                path: ':cid/:cname/grades/:gid/:gname/subjects',
                component: SubjectsListComponent
            },
            {
                path: ':cid/:cname/grades/:gid/:gname/subjects/:sid/:sname/chapters',
                component: ChaptersListComponent,
                resolve: {
                    phases: () => inject(ChaptersService).getPhases()
                }
            },
        ],
    },
] as Routes;
