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
    selectedGrade = 'Grade 1 - Section A - Math';
    displayedColumns: string[] = ['chapterName', 'status', 'completion'];
    query = '';
    card = {
        id: '1',
        grade: 'Grade 1',
        section: 'Section A',
        subject: 'Math',
        completed: 10,
        total: 50,
        get progress() {
            return Math.round((this.completed / this.total) * 100);
        },
    };
    chapters = [
        {
            id: 2,
            name: 'Chapter Name',
            status: 'In Progress',
            completion: '50%',
        },
    ];

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
            {
                label: this.selectedGrade,
                url: '',
            },
        ]);

        this.sectionMappingId = Number(this.route.snapshot.paramMap.get('id'));
        this.getChapterList();
    }

    getChapterList() {
        this._classesService
            .getSectionMappingDetails(this.sectionMappingId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (response) => {
                    console.log(response);
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
}
