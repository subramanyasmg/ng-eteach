import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { SnackBarService } from 'app/core/general/snackbar.service';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';
import { ClassesService } from 'app/services/classes.service';
import { SkeletonModule } from 'primeng/skeleton';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-classes',
    imports: [
        TranslocoModule,
        CommonModule,
        MatIconModule,
        MatButtonModule,
        MatInputModule,
        RouterModule,
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        SkeletonModule,
    ],
    templateUrl: './classes.component.html',
    styleUrl: './classes.component.scss',
})
export class ClassesComponent implements OnInit, OnDestroy {
    query = '';
    cardDataList = [];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private route: ActivatedRoute,
        private translocoService: TranslocoService,
        private titleService: BreadcrumbService,
        private _snackBar: SnackBarService,
        private _classesService: ClassesService
    ) {}

    ngOnInit(): void {
        this.titleService.setBreadcrumb([
            {
                label: this.translocoService.translate('navigation.curriculum'),
                url: 'manage-classes',
            },
            {
                label: this.translocoService.translate(
                    'navigation.manageClasses'
                ),
                url: 'manage-classes',
            },
        ]);

        this._classesService
            .getAll()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (response: any) => {
                    if (response.success && response.status === 200) {
                        this.cardDataList = response.data?.rows?.map((el) => ({
                            id: el.id,
                            grade: el.section.grade.grade_name,
                            section: el.section.section_name,
                            subject: el.subject.subject_name,
                            completed:
                                el.subject.syllabus_progress?.filter(
                                    (el) => el.status === 'COMPLETED'
                                )?.length || 0,
                            total: el.subject.chapter_count,
                        }));
                    } else {
                        this._snackBar.showError(
                            this.translocoService.translate(
                                'classes.classes_get_error'
                            )
                        );
                    }
                },
                (error) => {
                    console.error(error);
                    this._snackBar.showError(
                        this.translocoService.translate(
                            'classes.classes_get_error'
                        ) +
                            ' - ' +
                            error.message
                    );
                }
            );
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    get filteredList() {
        if (!this.query) {
            return this.cardDataList;
        }

        const lowerQuery = this.query.toLowerCase();

        return this.cardDataList.filter((chapter) =>
            chapter.grade?.toLowerCase().includes(lowerQuery)
        );
    }
}
