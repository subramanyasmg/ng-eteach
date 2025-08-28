import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { SnackBarService } from 'app/core/general/snackbar.service';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';
import { ClassesService } from 'app/services/classes.service';
import { ChipModule } from 'primeng/chip';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-chapters',
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
        MatTableModule,
        ChipModule,
    ],
    templateUrl: './chapters.component.html',
    styleUrl: './chapters.component.scss',
})
export class ChaptersComponent implements OnInit, OnDestroy {
    sectionMappingId;
    selectedGrade = '';
    displayedColumns: string[] = ['chapterName', 'status', 'completion'];
    query = '';
    completedChapter;
    chapters = [];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private route: ActivatedRoute,
        private translocoService: TranslocoService,
        private titleService: BreadcrumbService,
        private _snackBar: SnackBarService,
        private _classesService: ClassesService
    ) {}

    ngOnInit(): void {
        this.sectionMappingId = Number(this.route.snapshot.paramMap.get('id'));
        this.getChapterList();
    }

    generateBreadcrumb() {
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
            {
                label: this.selectedGrade,
                url: '',
            },
        ]);
    }

    getChapterList() {
        this._classesService
            .getSectionMappingDetails(this.sectionMappingId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (response: any) => {
                    console.log(response);
                    if (response.status === 200 && response.success) {
                        const data = response.data[0];
                        this.selectedGrade =
                            data.grade_name +
                            ' - ' +
                            data.section_name +
                            ' - ' +
                            data.subject_name;

                        this.generateBreadcrumb();

                        this.completedChapter =
                            data.completed_chapters + '/' + data.total_chapters;

                        this.chapters = data.chapters.map((el) => ({
                            id: el.id,
                            name: el.chapter_name,
                            status: el.status,
                            completion: el.completion_percentage,
                        }));
                    }
                },
                (error) => {
                    console.error(error);
                    this._snackBar.showError(
                        this.translocoService.translate(
                            'classes.subjects_get_error'
                        ) +
                            ' - ' +
                            error?.error?.message
                    );
                }
            );
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    get filteredChapterList() {
        if (!this.query) {
            return this.chapters;
        }

        const lowerQuery = this.query.toLowerCase();

        return this.chapters.filter((chapter) =>
            chapter.name?.toLowerCase().includes(lowerQuery)
        );
    }

    getStyleClass(status) {
        if (status === 'COMPLETED') {
            return 'bg-green-500 text-white';
        }
        if (status === 'INPROGRESS') {
            return 'bg-blue-500 text-white';
        }
    }
}
