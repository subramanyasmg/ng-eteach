import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';
import { selectAllCurriculums } from 'app/state/curriculum/curriculum.selectors';
import { filter, map, take } from 'rxjs';

@Component({
    selector: 'app-grades',
    imports: [],
    templateUrl: './grades.component.html',
    styleUrl: './grades.component.scss',
})
export class GradesListComponent {
    constructor(
        private route: ActivatedRoute,
        private store: Store,
        private titleService: BreadcrumbService
    ) {}

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');

          this.store.select(selectAllCurriculums).pipe(
            map(curriculums => curriculums.find(c => c.id === id)),
            filter(Boolean),
            take(1)
          ).subscribe(curriculum => {
            this.titleService.setBreadcrumb([
              { label: 'Curriculum', url: '/curriculum' },
              { label: 'Manage Curriculum', url: '/curriculum' },
              { label: `Grades for ${curriculum.name}`, url: '' },
            ]);
          });

        // this.titleService.setBreadcrumb([
        //     { label: 'Curriculum', url: '/curriculum' },
        //     { label: 'Manage Curriculum', url: '/curriculum' },
        //     { label: `Grades for test`, url: '' },
        // ]);
    }
}
