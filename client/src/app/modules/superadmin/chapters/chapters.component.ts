import { DragDropModule } from '@angular/cdk/drag-drop';
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
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { SnackBarService } from 'app/core/general/snackbar.service';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';
import { PipesModule } from 'app/pipes/pipes.module';
import { ChaptersService } from 'app/services/chapters.service';
import * as ChapterActions from 'app/state/chapters/chapters.actions';
import { selectChaptersBySubjectId } from 'app/state/chapters/chapters.selectors';
import * as CurriculumActions from 'app/state/curriculum/curriculum.actions';
import { selectAllCurriculums } from 'app/state/curriculum/curriculum.selectors';
import * as GradeActions from 'app/state/grades/grades.actions';
import { selectGradesByCurriculumId } from 'app/state/grades/grades.selectors';
import * as PublisherActions from 'app/state/publishers/publishers.actions';
import { selectAllPublishers } from 'app/state/publishers/publishers.selectors';
import * as SubjectActions from 'app/state/subjects/subjects.actions';
import { selectSubjectsByGradeId } from 'app/state/subjects/subjects.selectors';
import { QuillModule } from 'ngx-quill';
import { combineLatest, filter, map, Observable, take, tap } from 'rxjs';
import { IChapters } from '../../../models/chapters.types';

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
        DragDropModule,
        TranslocoModule,
        QuillModule,
    ],
    templateUrl: './chapters.component.html',
    styleUrl: './chapters.component.scss',
})
export class ChaptersListComponent implements OnInit {
    @ViewChild('EntityDialog') EntityDialog: TemplateRef<any>;
    @ViewChild('filePreviewModal') filePreviewModal: TemplateRef<any>;

    query = '';
    curriculumId;
    gradeId;
    subjectId;
    publisherId;
    subjectName = '';
    matDialogRef = null;
    entityForm: UntypedFormGroup;
    chapters$: Observable<IChapters[]>;
    chapterList: IChapters[];
    phases: [] = [];
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
        private translocoService: TranslocoService,
        private sanitizer: DomSanitizer,
        private titleService: BreadcrumbService,
        private _chapterService: ChaptersService
    ) {}

    ngOnInit(): void {
        this.curriculumId = Number(this.route.snapshot.paramMap.get('cid'));
        this.gradeId = Number(this.route.snapshot.paramMap.get('gid'));
        this.subjectId = Number(this.route.snapshot.paramMap.get('sid'));
        this.publisherId = Number(this.route.snapshot.paramMap.get('pid'));

        this.getAllPhases();

        this.store.dispatch(PublisherActions.loadPublishers());
        this.store.dispatch(
            CurriculumActions.loadCurriculums({ publisherId: this.publisherId })
        );
        this.store.dispatch(
            GradeActions.loadGrades({ curriculumId: this.curriculumId })
        );
        this.store.dispatch(
            SubjectActions.loadSubjects({ gradeId: this.gradeId })
        );
        this.store.dispatch(
            ChapterActions.loadChapters({ subjectId: this.subjectId })
        );

        setTimeout(() => {
            combineLatest([
                this.store.select(selectAllPublishers),
                this.store.select(selectAllCurriculums(this.publisherId)),
                this.store.select(
                    selectGradesByCurriculumId(this.curriculumId)
                ),
                this.store.select(selectSubjectsByGradeId(this.gradeId)),
            ])
                .pipe(
                    take(1),
                    map(([publishers, curriculums, grades, subjects]) => {
                        const publisher = publishers.find(
                            (p) => p.id === this.publisherId
                        );
                        const curriculum = curriculums.find(
                            (c) => c.id === this.curriculumId
                        );
                        const grade = grades?.find(
                            (g) => g.id === this.gradeId
                        );
                        const subject = subjects?.find(
                            (s) => s.id === this.subjectId
                        );
                        return { publisher, curriculum, grade, subject };
                    }),
                    filter(
                        ({ publisher, curriculum, grade, subject }) =>
                            !!publisher && !!curriculum && !!grade && !!subject
                    )
                )
                .subscribe(({ publisher, curriculum, grade, subject }) => {
                    this.subjectName = subject.subject_name;
                    this.titleService.setBreadcrumb([
                        {
                            label: this.translocoService.translate(
                                'navigation.curriculum'
                            ),
                            url: '/manage-publishers',
                        },
                        {
                            label: this.translocoService.translate(
                                'navigation.managePublishers'
                            ),
                            url: '/manage-publishers',
                        },
                        {
                            label: publisher.publication_name,
                            url: `/manage-publishers/${this.publisherId}/curriculum`,
                        },
                        {
                            label: curriculum.curriculum_name,
                            url: `/manage-publishers/${this.publisherId}/curriculum/${this.curriculumId}/grades`,
                        },
                        {
                            label: grade.grade_name,
                            url: `/manage-publishers/${this.publisherId}/curriculum/${this.curriculumId}/grades/${this.gradeId}/subjects`,
                        },
                        { label: subject.subject_name, url: '' },
                    ]);
                });
        }, 1000);

        this.entityForm = this._formBuilder.group({
            chapters: this._formBuilder.array([this.createChapter()]),
        });

        this.handleAPIResponse();

        this.store
            .select(selectChaptersBySubjectId(this.subjectId))
            .subscribe((data) => {
                this.chapterList = data.map((chapter) => ({
                    ...chapter,
                    editMode: false,
                    textBook: [],
                    referenceMaterials: [],
                    lessonPlan: this.clonePhases(
                        chapter.lessonPlan ?? this.phases
                    ),
                }));
            });
    }

    getAllPhases() {
        this._chapterService.phases$.subscribe(
            (response: any) => {
                if (response) {
                    this.phases = response.map((el: any) => ({
                        label: el.name,
                        content: '',
                        id: el.id,
                    }));
                } else {
                    this._snackBar.showError(
                        'No Phases available for Lesson Plans'
                    );
                }
            },
            (error) => {
                this._snackBar.showError(
                    'Oh no! Server error occured while fetching Phases for Lesson Plans'
                );
            }
        );
    }

    clonePhases(phases: any[]): any[] {
        return phases.map((phase) => ({ ...phase }));
    }

    onChapterExpand(chapter: IChapters, index: number): void {
        chapter.isLoading = true;
        this._chapterService.getChapterDetails(this.subjectId, chapter.id).subscribe({
            next: (response: any) => {
                console.log('response', response);
                // chapter.data = data;
                chapter.isLoading = false;
            },
            error: (error: any) => {
                 chapter.isLoading = false;
                 this._snackBar.showError(
                    `Error: ${error?.message || 'Something went wrong.'}`
                );
            }
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

        // Disable the form
        this.entityForm.disable();
        const formValues = this.entityForm.value;
        const requestObj: IChapters = {
            title: formValues.chapters.map((c) => c.name).join(','),
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
            title: this.newChapterName,
        };
        this.store.dispatch(
            ChapterActions.updateChapter({
                subjectId: this.subjectId,
                chapter: requestObj,
            })
        );
    }

    updateChapterPhase(chapter: IChapters, phase) {
        console.log(chapter, phase);
        const requestObj = {
            chapter_id: chapter.id,
            phase_id: phase.id,
            content_type: "TEXT",
            content_text: phase.content
        };
        this._chapterService.createLessonPlan(requestObj).subscribe({
            next: (response: any) => {
                console.log('response', response);
                if (response.status === 200) {
                    this._snackBar.showSuccess(
                        `Lesson plan created successfully!`
                    );
                }
            },
            error: (error: any) => {
                this._snackBar.showError(
                    `Error: ${error?.message || 'Something went wrong.'}`
                );
            }
        });
    }

    onFileDrop(chapter: IChapters, event: DragEvent, type) {
        event.preventDefault();
        const files = Array.from(event.dataTransfer?.files || []);
        this.addFiles(chapter, files, type);
    }

    onDragOver(chapter: IChapters, event: DragEvent, type) {
        event.preventDefault();
    }

    onDragLeave(chapter: IChapters, event: DragEvent, type) {
        event.preventDefault();
    }

    onFileSelected(chapter: IChapters, event: Event, type) {
        const input = event.target as HTMLInputElement;
        const files = Array.from(input.files || []);
        this.addFiles(chapter, files, type);
    }

    addFiles(chapter: IChapters, files: File[], type) {
        type === 1
            ? (chapter.textBook = [...files])
            : chapter.referenceMaterials.push(...files);
    }

    removeFile(chapter: IChapters, index: number, type) {
        type == 1
            ? chapter.textBook.splice(index, 1)
            : chapter.referenceMaterials.splice(index, 1);
    }

    previewFile(file: File): void {
        const objectUrl = URL.createObjectURL(file);
        const safeUrl: SafeResourceUrl =
            this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);

        this.matDialogRef = this._matDialog.open(this.filePreviewModal, {
            width: '800px',
            data: {
                name: file.name,
                url: safeUrl,
                type: file.type,
            },
        });

        this.matDialogRef.afterClosed().subscribe(() => {
            URL.revokeObjectURL(objectUrl); // prevent memory leaks
        });
    }

    isImageFile(type: string): boolean {
        return type.startsWith('image/');
    }

    isPdfFile(type: string): boolean {
        return type === 'application/pdf';
    }

    isVideoFile(type: string): boolean {
        return type.startsWith('video/');
    }

    isAudioFile(type: string): boolean {
        return type.startsWith('audio/');
    }

    isSupportedFile(type: string): boolean {
        return (
            this.isImageFile(type) ||
            this.isPdfFile(type) ||
            this.isVideoFile(type) ||
            this.isAudioFile(type)
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
            this.newChapterName = chapter.title;
        } else {
            this.newChapterName = '';
        }
    }

    deleteItem(item: IChapters): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: this.translocoService.translate(
                'common.deleteConfirmationTitle'
            ),
            message: this.translocoService.translate(
                'common.deleteConfirmationMessage'
            ),
            actions: {
                confirm: {
                    label: this.translocoService.translate(
                        'common.deletePermanently'
                    ),
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
                            this.translocoService.translate(
                                'chapters.success_add'
                            )
                        );
                    } else if (
                        action.type === ChapterActions.updateChapterSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                            this.translocoService.translate(
                                'chapters.success_update'
                            )
                        );
                    } else if (
                        action.type === ChapterActions.deleteChapterSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                            this.translocoService.translate(
                                'chapters.success_delete'
                            )
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
