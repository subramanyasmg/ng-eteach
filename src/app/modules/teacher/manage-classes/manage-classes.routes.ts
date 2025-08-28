import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { ChaptersService } from 'app/services/chapters.service';
import { ChapterDetailsComponent } from './chapter-details/chapter-details.component';
import { ChaptersComponent } from './chapters/chapters.component';
import { ClassesComponent } from './classes/classes.component';
import { ManageClassesComponent } from './manage-classes.component';

export default [
    {
        path: '',
        component: ManageClassesComponent,
        children: [
            {
                path: '',
                component: ClassesComponent,
            },
            {
                path: ':id/chapters',
                component: ChaptersComponent,
            },
            {
                path: ':id/chapters/:cid/:name/details',
                component: ChapterDetailsComponent,
                resolve: {
                    phases: () => inject(ChaptersService).getPhases(),
                },
            },
        ],
    },
] as Routes;
