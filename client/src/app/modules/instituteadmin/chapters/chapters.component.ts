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
import { IChapters } from 'app/models/chapters.types';
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
      PipesModule,
      MatExpansionModule,
      DragDropModule,
      TranslocoModule,
      QuillModule,
  ],
  templateUrl: './chapters.component.html',
  styleUrl: './chapters.component.scss'
})
export class ChaptersComponent implements OnInit {

  @ViewChild('filePreviewModal') filePreviewModal: TemplateRef<any>;

   query = '';
   curriculumId = "1";
   gradeId;
   subjectId;
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
      this.gradeId = Number(this.route.snapshot.paramMap.get('id'));
      this.subjectId = Number(this.route.snapshot.paramMap.get('sid'));

      this.getAllPhases();

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
              this.store.select(
                  selectGradesByCurriculumId(this.curriculumId)
              ),
              this.store.select(selectSubjectsByGradeId(this.gradeId)),
          ])
              .pipe(
                  take(1),
                  map(([grades, subjects]) => {
                      const grade = grades?.find(
                          (g) => g.id === this.gradeId
                      );
                      const subject = subjects?.find(
                          (s) => s.id === this.subjectId
                      );
                      return { grade, subject };
                  }),
                  filter(
                      ({  grade, subject }) =>
                           !!grade && !!subject
                  )
              )
              .subscribe(({  grade, subject }) => {
                  this.subjectName = subject.subject_name;
                  this.titleService.setBreadcrumb([
                      {
                          label: this.translocoService.translate(
                              'navigation.curriculum'
                          ),
                          url: 'curriculum',
                      },
                      {
                          label: this.translocoService.translate(
                              'navigation.manageCurriculum'
                          ),
                          url: 'curriculum',
                      },
                      {
                          label: grade.grade_name,
                          url: `curriculum/${this.gradeId}/subjects`,
                      },
                      { label: subject.subject_name, url: '' },
                  ]);
              });
      }, 1000);

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

  get filteredChapterList() {
        if (!this.query) {
            return this.chapterList;
        }

        const lowerQuery = this.query.toLowerCase();

        return this.chapterList.filter(chapter =>
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
                        edit: false
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
        this._chapterService.getChapterDetails(this.subjectId, chapter.id).subscribe({
            next: (response: any) => {
                console.log('response', response);
                console.log('chapter', chapter);
                chapter.isLoading = false;

                const lessonPlansFromApi =
                    response?.data?.lesson_plans ?? [];

                chapter.lessonPlan.forEach((lesson) => {
                    // Find the corresponding lesson_plan from API where phase_id matches lesson.id
                    const matchingLesson = lessonPlansFromApi.find(
                        (lp) => lp.phase_id === lesson.id
                    );

                    if (matchingLesson) {
                        lesson.content = matchingLesson.content_text || '';
                    }
                });

                // textbook
                chapter.textBook = response?.data?.textbooks[0];

                // reference materials
                chapter.referenceMaterials = response?.data?.reference_materials;
            },
            error: (error: any) => {
                 chapter.isLoading = false;
                 this._snackBar.showError(
                    `Error: ${error?.message || 'Something went wrong.'}`
                );
            }
        });
    }

    onFileDrop(chapter: IChapters, event: DragEvent, type) {
        event.preventDefault();
        const files = Array.from(event.dataTransfer?.files || []);
        if (type === 1 && files.length > 0) {
            this.uploadTextbookFile(files[0], chapter); 
        }
        if (type === 2 && files.length > 0) {
            if (files.length > 10) {
                this._snackBar.showError(this.translocoService.translate(
                        'chapters.max_limit_reached'
                    ));
            } else {
                this.uploadReferenceMaterialFiles(files, chapter);
            }
        }
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
            this.uploadTextbookFile(files[0], chapter); 
        }
        if (type === 2 && files.length > 0) {
            if (files.length > 10) {
                this._snackBar.showError(this.translocoService.translate(
                        'chapters.max_limit_reached'
                    ));
            } else {
                this.uploadReferenceMaterialFiles(files, chapter);
            }
        }
    }

    uploadTextbookFile(file: File, chapter: IChapters) {
        this._chapterService.uploadTextbook(file, +chapter.id).subscribe({
            next: (res) => {
                console.log('Upload success:', res);
                if (res.success && res.status === 200) {
                    this.addFiles(chapter, [res.file], 1);
                    this._snackBar.showSuccess( this.translocoService.translate(
                        'chapters.textbook_upload_success'
                    ));
                } else {
                    this._snackBar.showError(this.translocoService.translate(
                    'chapters.textbook_upload_error'
                ) + ' - ' +res.message);
                }
            },
            error: (err) => {
                console.error('Upload failed:', err);
                this._snackBar.showError( this.translocoService.translate(
                    'chapters.textbook_upload_error'
                ));
            },
        });
    }

    uploadReferenceMaterialFiles(files: File[], chapter: IChapters) {
        this._chapterService.uploadReferenceMaterial(files, +chapter.id).subscribe({
            next: (res) => {
                console.log('Upload success:', res);
                if (res.success && res.status === 200) {
                    this.addFiles(chapter, files.length === 1 ? [res.file]:res.files, 2);
                    this._snackBar.showSuccess( this.translocoService.translate(
                        'chapters.rm_upload_success'
                    ));
                } else {
                    this._snackBar.showError(this.translocoService.translate(
                    'chapters.rm_upload_error'
                ) + ' - ' +res.message);
                }
            },
            error: (err) => {
                console.error('Upload failed:', err);
                this._snackBar.showError( this.translocoService.translate(
                    'chapters.rm_upload_error'
                ));
            },
        });
    }

    deleteTextbook(chapter:IChapters) {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: this.translocoService.translate(
                'chapters.deleteTBConfirmationTitle'
            ),
            message: this.translocoService.translate(
                'chapters.deletefileConfirmationMessage'
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
                this._chapterService.deleteTextbook(chapter.textBook.id).subscribe({
                next: (res) => {
                    console.log('Delete success:', res);
                    chapter.textBook = null;
                    this._snackBar.showSuccess( this.translocoService.translate(
                        'chapters.textbook_delete_success'
                    ));
                },
                error: (err) => {
                    console.error('Delete failed:', err);
                    this._snackBar.showError( this.translocoService.translate(
                        'chapters.textbook_delete_error'
                    ));
                },
            });
                
            }
        });
    }

    addFiles(chapter: IChapters, files, type) {
        console.log('files', files);
        type === 1
            ? (chapter.textBook = Object.assign({}, ...files))
            : chapter.referenceMaterials.push(...files);
    }

    deleteReferenceMaterial(chapter:IChapters, file) {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: this.translocoService.translate(
                'chapters.deleteRMConfirmationTitle'
            ),
            message: this.translocoService.translate(
                'chapters.deletefileConfirmationMessage'
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
                this._chapterService.deleteReferenceMaterial(file.id).subscribe({
                next: (res) => {
                    console.log('Delete success:', res);
                    chapter.referenceMaterials = chapter.referenceMaterials.filter(rmFile => Number(rmFile.id) !== Number(file.id));
                    this._snackBar.showSuccess( this.translocoService.translate(
                        'chapters.rm_delete_success'
                    ));
                },
                error: (err) => {
                    console.error('Delete failed:', err);
                    this._snackBar.showError( this.translocoService.translate(
                        'chapters.rm_delete_error'
                    ));
                },
            });
                
            }
        });
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

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

}
