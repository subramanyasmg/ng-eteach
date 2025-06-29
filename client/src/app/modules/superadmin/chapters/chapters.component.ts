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
import { MatRippleModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
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
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { SnackBarService } from 'app/core/general/snackbar.service';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';
import { PipesModule } from 'app/pipes/pipes.module';
import * as ChapterActions from 'app/state/chapters/chapters.actions';
import { selectChaptersBySubjectId } from 'app/state/chapters/chapters.selectors';
import { selectAllCurriculums } from 'app/state/curriculum/curriculum.selectors';
import { selectGradesByCurriculumId } from 'app/state/grades/grades.selectors';
import { selectSubjectsByGradeId } from 'app/state/subjects/subjects.selectors';
import { combineLatest, filter, map, Observable, take, tap } from 'rxjs';
import { IChapters } from './chapters.types';

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
        MatIconModule,
        PipesModule,
        MatTabsModule,
        MatExpansionModule,
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
    chapters$: Observable<IChapters[]>;
    chapterList: IChapters[];
    newChapterName: string = '';

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

        this.handleAPIResponse();

        this.store
            .select(selectChaptersBySubjectId(this.subjectId))
            .subscribe((data) => {
                console.log(data);
                this.chapterList = data.map((chapter) => ({
                    ...chapter,
                    editMode: false,
                    lessonPlan: chapter.lessonPlan ?? this.defaultPhases(), // ensure phases exist
                }));
            });
    }

    defaultPhases() {
        return [
            { label: 'Phase 1: Engage', content: '' },
            { label: 'Phase 2: Explore', content: '' },
            { label: 'Phase 3: Explain', content: '' },
            { label: 'Phase 4: Elaborate', content: '' },
            { label: 'Phase 5: Evaluate', content: '' },
        ];
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

        // Disable the form
        this.entityForm.disable();
        const formValues = this.entityForm.value;
        const requestObj: IChapters = {
            name: formValues.chapters.map((c) => c.name).join(','),
        };
        this.store.dispatch(
            ChapterActions.addChapter({
                subjectId: this.subjectId,
                chapters: requestObj,
            })
        );
    }

    noChapterNameModelChange(event, chapter: IChapters) {
        this.newChapterName = event.trim();
    }

    updateChapterName(chapter: IChapters) {
        const requestObj: IChapters = {
            id: chapter.id,
            name: this.newChapterName,
        };
        this.store.dispatch(
            ChapterActions.updateChapter({
                subjectId: this.subjectId,
                chapter: requestObj,
            })
        );
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
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

    toggleEditChapter(chapter: IChapters) {
        chapter.editMode = !chapter.editMode;
        if (chapter.editMode) {
            this.newChapterName = chapter.name;
        } else {
            this.newChapterName = '';
        }
    }

    deleteItem(item: IChapters): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Are you sure you want to delete?',
            message:
                'Taking this action will permanently delete this entry. Are you sure about taking this action?',
            actions: {
                confirm: {
                    label: 'Delete Permanently',
                },
            },
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {
            // If the confirm button pressed...
            if (result === 'confirmed') {
                this.store.dispatch(
                    ChapterActions.deleteChapter({
                        subjectId: this.subjectId,
                        chapterId: item.id,
                    })
                );
            }
        });
    }

    handleAPIResponse() {
        this.actions$
            .pipe(
                ofType(
                    ChapterActions.addChapterSuccess,
                    ChapterActions.addChapterFailure,
                    ChapterActions.updateChapterSuccess,
                    ChapterActions.updateChapterFailure,
                    ChapterActions.deleteChapterSuccess,
                    ChapterActions.deleteChapterFailure
                ),
                tap((action: any) => {
                    // Close dialog on add/update success/failure
                    if (
                        action.type === ChapterActions.addChapterSuccess.type ||
                        action.type === ChapterActions.addChapterFailure.type ||
                        action.type ===
                            ChapterActions.updateChapterSuccess.type ||
                        action.type === ChapterActions.updateChapterFailure.type
                    ) {
                        this.matDialogRef?.close(true);
                    }

                    // Handle success
                    if (action.type === ChapterActions.addChapterSuccess.type) {
                        this._snackBar.showSuccess(
                            `Chapter has been added successfully!`
                        );
                    } else if (
                        action.type === ChapterActions.updateChapterSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                            `Chapter updated successfully!`
                        );
                    } else if (
                        action.type === ChapterActions.deleteChapterSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                            `Chapter deleted successfully!`
                        );
                    }

                    // Handle failure
                    else if (
                        action.type === ChapterActions.addChapterFailure.type ||
                        action.type ===
                            ChapterActions.updateChapterFailure.type ||
                        action.type === ChapterActions.deleteChapterFailure.type
                    ) {
                        this._snackBar.showError(
                            `Error: ${action.error?.message || 'Something went wrong.'}`
                        );
                    }
                })
            )
            .subscribe();
    }
}
