import { Routes } from '@angular/router';
import { PublishersComponent } from './publishers.component';
import { CurriculumListComponent } from '../curriculum/curriculum-list/curriculum-list.component';
import { GradesListComponent } from '../grades/grades.component';
import { SubjectsListComponent } from '../subjects/subjects.component';
import { ChaptersListComponent } from '../chapters/chapters.component';
import { PublishersListComponent } from './publishers-list/publishers-list.component';
import { SubjectsService } from 'app/services/subjects.service';
import { inject } from '@angular/core';
import { ChaptersService } from 'app/services/chapters.service';

export default [
    {
        path: '',
        component: PublishersComponent,
        children: [
            {
                path: '',
                component: PublishersListComponent
            },
            {
                path: ':id/curriculum',
                component: CurriculumListComponent
            },
            {
                path: ':pid/curriculum/:cid/grades',
                component: GradesListComponent,
            },
            {
                path: ':pid/curriculum/:cid/grades/:gid/subjects',
                component: SubjectsListComponent
            },
            {
                path: ':pid/curriculum/:cid/grades/:gid/subjects/:sid/chapters',
                component: ChaptersListComponent,
                resolve: {
                    phases: () => inject(ChaptersService).getPhases()
                }
            },
        ],
    },
] as Routes;
