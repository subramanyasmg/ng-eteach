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
      MatIconModule,
      PipesModule,
      MatTabsModule,
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
                // chapter.data = data;
                chapter.isLoading = false;

                const lessonPlansFromApi = response?.data?.[0]?.lesson_plans ?? [];
                 chapter.lessonPlan.forEach(lesson => {
                    // Find the corresponding lesson_plan from API where phase_id matches lesson.id
                    const matchingLesson = lessonPlansFromApi.find(lp => lp.phase_id === lesson.id);

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
            }
        });
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

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

}
