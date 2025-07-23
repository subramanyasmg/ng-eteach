import { Routes } from '@angular/router';
import { ManageClassesComponent } from './manage-classes.component';
import { ClassesComponent } from './classes/classes.component';
import { ChaptersComponent } from './chapters/chapters.component';
import { ChapterDetailsComponent } from './chapter-details/chapter-details.component';
import { inject } from '@angular/core';
import { ChaptersService } from 'app/services/chapters.service';

export default [
    {
        path: '',
        component: ManageClassesComponent,
        children: [
            {
                path: '',
                component: ClassesComponent
            },
            {
                path: ':id/chapters',
                component: ChaptersComponent
            },
            {
                path: ':id/chapters/:cid/details',
                component: ChapterDetailsComponent,
                resolve: {
                    phases: () => inject(ChaptersService).getPhases()
                }
            }
        ]
    },
] as Routes;
