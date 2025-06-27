import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import {
    FormArray,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { SnackBarService } from 'app/core/general/snackbar.service';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';
import { selectAllCurriculums } from 'app/state/curriculum/curriculum.selectors';
import { selectGradesByCurriculumId } from 'app/state/grades/grades.selectors';
import { selectSubjectsByGradeId } from 'app/state/subjects/subjects.selectors';
import { combineLatest, filter, map, Subject, take } from 'rxjs';

@Component({
    selector: 'app-chapters',
    standalone: true,
    imports: [
        MatProgressBarModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatPaginatorModule,
        MatRippleModule,
        MatProgressSpinnerModule,
        MatSnackBarModule,
        MatTooltipModule,
        MatTabsModule,
        MatTableModule,
        CommonModule,
        ReactiveFormsModule,
        MatSortModule,
        MatSelectModule,
        MatChipsModule,
    ],
    templateUrl: './chapters.component.html',
    styleUrl: './chapters.component.scss',
})
export class ChaptersListComponent implements OnInit {
    @ViewChild('EntityDialog') EntityDialog: TemplateRef<any>;

    query = '';
    curriculumId;
    gradeId;
    subjectId;
    subjectName = '';
    matDialogRef = null;
    entityForm: UntypedFormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private route: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService,
        private store: Store,
        private _formBuilder: UntypedFormBuilder,
        private _snackBar: SnackBarService,
        private _matDialog: MatDialog,
        private actions$: Actions,
        private _cdr: ChangeDetectorRef,
        private titleService: BreadcrumbService
    ) {}

    ngOnInit(): void {
        this.curriculumId = this.route.snapshot.paramMap.get('cid');
        this.gradeId = this.route.snapshot.paramMap.get('gid');
        this.subjectId = this.route.snapshot.paramMap.get('sid');

        combineLatest([
            this.store.select(selectAllCurriculums),
            this.store.select(selectGradesByCurriculumId(this.curriculumId)),
            this.store.select(selectSubjectsByGradeId(this.gradeId)),
        ])
            .pipe(
                take(1),
                map(([curriculums, grades, subjects]) => {
                    const curriculum = curriculums.find(
                        (c) => c.id === this.curriculumId
                    );
                    const grade = grades?.find((g) => g.id === this.gradeId);
                    const subject = subjects?.find(
                        (s) => s.id === this.subjectId
                    );
                    return { curriculum, grade, subject };
                }),
                filter(
                    ({ curriculum, grade, subject }) =>
                        !!curriculum && !!grade && !!subject
                )
            )
            .subscribe(({ curriculum, grade, subject }) => {
                this.subjectName = subject.name;
                this.titleService.setBreadcrumb([
                    { label: 'Curriculum', url: '/curriculum' },
                    { label: 'Manage Curriculum', url: '/curriculum' },
                    {
                        label: curriculum.name,
                        url: `/curriculum/${this.curriculumId}/grades`,
                    },
                    {
                        label: grade.name,
                        url: `/curriculum/${this.curriculumId}/grades/${this.gradeId}/subjects`,
                    },
                    { label: subject.name, url: '' },
                ]);
            });

        this.entityForm = this._formBuilder.group({
            chapters: this._formBuilder.array([this.createChapter()]),
        });
    }

    get chapters(): FormArray {
        return this.entityForm.get('chapters') as FormArray;
    }

    createChapter(): FormGroup {
        return this._formBuilder.group({
            name: ['', Validators.required],
        });
    }

    addChapter(): void {
        this.chapters.push(this.createChapter());
    }

    removeChapter(index: number): void {
        if (this.chapters.length > 1) {
            this.chapters.removeAt(index);
        }
    }

    addEntity() {
        // Return if the form is invalid
        if (this.entityForm.invalid) {
            return;
        }

        console.log(this.entityForm.value);
    }

    applyFilter(): void {
        const filterValue = this.query?.trim().toLowerCase() || '';
        // this.dataSource.filter = filterValue;
    }

    openDialog() {
        this.matDialogRef = this._matDialog.open(this.EntityDialog, {
            width: '500px',
        });

         this.matDialogRef.afterClosed().subscribe((result) => {
            this.entityForm.enable();
            this.entityForm.reset();
            this.chapters.clear(); // clear all form array items
            this.chapters.push(this.createChapter()); // add one blank row
        });
    }
}
