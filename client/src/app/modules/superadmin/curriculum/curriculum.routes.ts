import { Routes } from '@angular/router';
import { GradesListComponent } from '../grades/grades.component';
import { CurriculumListComponent } from './curriculum-list/curriculum-list.component';
import { CurriculumComponent } from './curriculum.component';
import { SubjectsListComponent } from '../subjects/subjects.component';
import { ChaptersListComponent } from '../chapters/chapters.component';

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
                path: ':id/grades',
                component: GradesListComponent,
            },
            {
                path: ':cid/grades/:gid/subjects',
                component: SubjectsListComponent
            },
            {
                path: ':cid/grades/:gid/subjects/:sid/chapters',
                component: ChaptersListComponent
            },
        ],
    },
] as Routes;
