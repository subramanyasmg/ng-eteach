import { Routes } from '@angular/router';
import { ManageClassesComponent } from './manage-classes.component';
import { ClassesComponent } from './classes/classes.component';
import { ChaptersComponent } from './chapters/chapters.component';
import { ChapterDetailsComponent } from './chapter-details/chapter-details.component';

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
                component: ChaptersComponent,
                children: [
                    {
                        path: ':id/details',
                        component: ChapterDetailsComponent
                    }
                ]
            }
        ]
    },
] as Routes;
