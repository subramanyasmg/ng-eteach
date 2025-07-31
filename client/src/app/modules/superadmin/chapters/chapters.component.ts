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
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { USER_TYPES } from 'app/constants/usertypes';

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
    user:User = null;
    readonly USER_TYPES = USER_TYPES;
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
        private _userService: UserService,
        private _chapterService: ChaptersService
    ) {}

    ngOnInit(): void {
         // Check if the User Type is Publisher or Super Admin
        this._userService.user$.pipe(take(1)).subscribe((user: User) => {
            this.user = user;

            switch (this.user.type) {
                case USER_TYPES.SUPER_ADMIN: {
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
                                            url: 'manage-publishers',
                                        },
                                        {
                                            label: this.translocoService.translate(
                                                'navigation.managePublishers'
                                            ),
                                            url: 'manage-publishers',
                                        },
                                        {
                                            label: publisher.publication_name,
                                            url: `manage-publishers/${this.publisherId}/curriculum`,
                                        },
                                        {
                                            label: curriculum.curriculum_name,
                                            url: `manage-publishers/${this.publisherId}/curriculum/${this.curriculumId}/grades`,
                                        },
                                        {
                                            label: grade.grade_name,
                                            url: `manage-publishers/${this.publisherId}/curriculum/${this.curriculumId}/grades/${this.gradeId}/subjects`,
                                        },
                                        { label: subject.subject_name, url: '' },
                                    ]);
                                });
                        }, 1000);
                        this.getChaptersFromStore();
                }
                break;
                case USER_TYPES.PUBLISHER_ADMIN:
                case USER_TYPES.PUBLISHER_USER: {
                        this.curriculumId = Number(this.route.snapshot.paramMap.get('cid'));
                        this.gradeId = Number(this.route.snapshot.paramMap.get('gid'));
                        this.subjectId = Number(this.route.snapshot.paramMap.get('sid'));
                        this.publisherId = this.user.id;

                        this.getAllPhases();

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
                                this.store.select(selectAllCurriculums(this.publisherId)),
                                this.store.select(
                                    selectGradesByCurriculumId(this.curriculumId)
                                ),
                                this.store.select(selectSubjectsByGradeId(this.gradeId)),
                            ])
                                .pipe(
                                    take(1),
                                    map(([ curriculums, grades, subjects]) => {
                                        const curriculum = curriculums.find(
                                            (c) => c.id === this.curriculumId
                                        );
                                        const grade = grades?.find(
                                            (g) => g.id === this.gradeId
                                        );
                                        const subject = subjects?.find(
                                            (s) => s.id === this.subjectId
                                        );
                                        return { curriculum, grade, subject };
                                    }),
                                    filter(
                                        ({  curriculum, grade, subject }) =>
                                           !!curriculum && !!grade && !!subject
                                    )
                                )
                                .subscribe(({ curriculum, grade, subject }) => {
                                    this.subjectName = subject.subject_name;
                                    this.titleService.setBreadcrumb([
                                        {
                                            label: this.translocoService.translate(
                                                'navigation.curriculum'
                                            ),
                                            url: 'manage-curriculum',
                                        },
                                        {
                                            label: this.translocoService.translate(
                                                'navigation.manageCurriculum'
                                            ),
                                            url: 'manage-curriculum',
                                        },
                                        {
                                            label: curriculum.curriculum_name,
                                            url: `manage-curriculum/${this.curriculumId}/grades`,
                                        },
                                        {
                                            label: grade.grade_name,
                                            url: `manage-curriculum/${this.curriculumId}/grades/${this.gradeId}/subjects`,
                                        },
                                        { label: subject.subject_name, url: '' },
                                    ]);
                                });
                        }, 1000);
                        this.getChaptersFromStore();
                }
                break;
            }
        });

        this.entityForm = this._formBuilder.group({
            chapters: this._formBuilder.array([this.createChapter()]),
        });

        this.handleAPIResponse();
    }

    getChaptersFromStore() {
        this.store
        .select(selectChaptersBySubjectId(this.subjectId))
        .subscribe((data) => {
            this.chapterList = data.map((chapter) => ({
                ...chapter,
                editMode: false,
                textBook: null,
                referenceMaterials: [],
                lessonPlan: this.clonePhases(
                    chapter.lessonPlan ?? this.phases
                ),
            }));
        });
    }

    get filteredChapterList() {
        if (!this.query) {
            return this.chapterList;
        }

        const lowerQuery = this.query.toLowerCase();

        return this.chapterList.filter((chapter) =>
            chapter.title?.toLowerCase().includes(lowerQuery)
        );
    }

    getAllPhases() {
        this._chapterService.phases$.subscribe(
            (response: any) => {
                if (response) {
                    this.phases = response.map((el: any) => ({
                        label: el.name,
                        content: null,
                        id: el.id,
                        edit: false,
                    }));
                } else {
                    this._snackBar.showError(
                        this.translocoService.translate(
                            'chapters.no_phases_available'
                        )
                    );
                }
            },
            (error) => {
                this._snackBar.showError(
                    this.translocoService.translate(
                        'chapters.phase_server_error'
                    )
                );
            }
        );
    }

    clonePhases(phases: any[]): any[] {
        return phases.map((phase) => ({ ...phase }));
    }

    onChapterExpand(chapter: IChapters, index: number): void {
        chapter.isLoading = true;
        this._chapterService
            .getChapterDetails(this.subjectId, chapter.id)
            .subscribe({
                next: (response: any) => {
                    console.log('response', response);
                    console.log('chapter', chapter);
                    // chapter.data = data;
                    chapter.isLoading = false;

                    const lessonPlansFromApi =
                        response?.data?.[0]?.lesson_plans ?? [];
                    chapter.lessonPlan.forEach((lesson) => {
                        // Find the corresponding lesson_plan from API where phase_id matches lesson.id
                        const matchingLesson = lessonPlansFromApi.find(
                            (lp) => lp.phase_id === lesson.id
                        );

                        if (matchingLesson) {
                            lesson.content = matchingLesson.content_text || '';
                        }
                    });
                },
                error: (error: any) => {
                    chapter.isLoading = false;
                    this._snackBar.showError(
                        `Error: ${error?.message || 'Something went wrong.'}`
                    );
                },
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
            content_type: 'TEXT',
            content_text: phase.content,
        };
        this._chapterService.createLessonPlan(requestObj).subscribe({
            next: (response: any) => {
                console.log('response', response);
                if (response.status === 200) {
                    this._snackBar.showSuccess(
                        this.translocoService.translate(
                            'chapters.lesson_plan_update_success'
                        )
                    );
                }
            },
            error: (error: any) => {
                this._snackBar.showError(
                    `Error: ${error?.message || 'Something went wrong.'}`
                );
            },
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

        if (type === 1 && files.length > 0) {
            this.uploadTextbookFile(files[0], chapter); // assuming chapter has an `id`
        }
    }

    uploadTextbookFile(file: File, chapter: IChapters) {
        this._chapterService.uploadTextbook(file, +chapter.id).subscribe({
            next: (res) => {
                console.log('Upload success:', res);
                this.addFiles(chapter, [res.file], 1);
                this._snackBar.showSuccess( this.translocoService.translate(
                    'chapters.textbook_upload_success'
                ));
            },
            error: (err) => {
                console.error('Upload failed:', err);
                this._snackBar.showError( this.translocoService.translate(
                    'chapters.textbook_upload_error'
                ));
            },
        });
    }

    addFiles(chapter: IChapters, files, type) {
        console.log('files', files);
        type === 1
            ? (chapter.textBook = Object.assign({}, ...files))
            : chapter.referenceMaterials.push(...files);
    }

    removeFile(chapter: IChapters, index: number, type) {
        type == 1
            ? chapter.textBook.splice(index, 1)
            : chapter.referenceMaterials.splice(index, 1);
    }

    previewFile(file: any): void {
        const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(file.s3Url);
        this.matDialogRef = this._matDialog.open(this.filePreviewModal, {
            height: 'calc(100% - 30px)',
            width: 'calc(100% - 30px)',
            maxWidth: '100%',
            maxHeight: '100%',
            data: {
                name: file.filename,
                url: safeUrl,
                type: file.mimeType,
            },
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
