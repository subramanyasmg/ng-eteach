import { Routes } from '@angular/router';
import { PublishersComponent } from './publishers.component';
import { CurriculumListComponent } from '../curriculum/curriculum-list.component';
import { GradesListComponent } from '../grades/grades.component';
import { SubjectsListComponent } from '../subjects/subjects.component';
import { ChaptersListComponent } from '../chapters/chapters.component';
import { PublishersListComponent } from './publishers-list/publishers-list.component';
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
                path: ':id/:name/curriculum',
                component: CurriculumListComponent
            },
            {
                path: ':pid/:pname/curriculum/:cid/:cname/grades',
                component: GradesListComponent,
            },
            {
                path: ':pid/:pname/curriculum/:cid/:cname/grades/:gid/:gname/subjects',
                component: SubjectsListComponent
            },
            {
                path: ':pid/:pname/curriculum/:cid/:cname/grades/:gid/:gname/subjects/:sid/:sname/chapters',
                component: ChaptersListComponent,
                resolve: {
                    phases: () => inject(ChaptersService).getPhases()
                }
            },
        ],
    },
] as Routes;
