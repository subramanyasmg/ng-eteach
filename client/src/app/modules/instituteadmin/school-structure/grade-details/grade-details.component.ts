import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import {
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
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { SnackBarService } from 'app/core/general/snackbar.service';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';
import { ISections } from 'app/models/sections.types';
import { ISubjects } from 'app/models/subject.types';
import { PipesModule } from 'app/pipes/pipes.module';
import { SectionsService } from 'app/services/sections.service';
import { TeachersService } from 'app/services/teachers.service';
import * as GradeActions from 'app/state/grades/grades.actions';
import { selectGradesByCurriculumId } from 'app/state/grades/grades.selectors';
import * as SectionActions from 'app/state/sections/sections.actions';
import { selectSectionsByGradeId } from 'app/state/sections/sections.selectors';
import * as SubjectActions from 'app/state/subjects/subjects.actions';
import { selectSubjectsByGradeId } from 'app/state/subjects/subjects.selectors';
import * as TeacherActions from 'app/state/teachers/teacher.actions';
import { selectAllTeachers } from 'app/state/teachers/teacher.selectors';
import { QuillModule } from 'ngx-quill';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { filter, map, Observable, Subject, take, takeUntil, tap } from 'rxjs';

@Component({
    selector: 'app-grade-details',
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
        MatChipsModule,
        SkeletonModule,
        QuillModule,
        SelectModule,
    ],
    templateUrl: './grade-details.component.html',
    styleUrl: './grade-details.component.scss',
})
export class GradeDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('filePreviewModal') filePreviewModal: TemplateRef<any>;
    @ViewChild('EntityDialog') EntityDialog: TemplateRef<any>;

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    query = '';
    curriculumId = '1';
    gradeId;
    gradeName = null;
    matDialogRef = null;
    entityForm: UntypedFormGroup;
    subjects$: Observable<ISubjects[]> = null;
    phases: [] = [];
    isSubjectsLoading = true;
    newSectionName: string = '';
    sectionList: ISections[];
    subjectForSections = [];
    displayedColumns: string[] = [
        'subjectName',
        'teacher',
        'chapters',
        'completion',
    ];
    teacherList: any[] = null;

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
        private _teacherService: TeachersService,
        private _sectionService: SectionsService
    ) {}

    ngOnInit(): void {
        this.gradeId = Number(this.route.snapshot.paramMap.get('id'));

        this.store.dispatch(
            GradeActions.loadGrades({ curriculumId: this.curriculumId })
        );
        this.store.dispatch(
            SubjectActions.loadSubjects({ gradeId: this.gradeId })
        );
        this.subjects$ = this.store.select(
            selectSubjectsByGradeId(this.gradeId)
        );
        this.store.dispatch(
            SectionActions.loadSections({ gradeId: this.gradeId })
        );

        this.store.dispatch(TeacherActions.loadTeachers());

        this.handleAPIResponse();

        this.entityForm = this._formBuilder.group({
            name: ['', [Validators.required]],
        });

        this.store
            .select(selectAllTeachers)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
               
               this.teacherList = data.map((el) => ({
                    id: el.id,
                    name: el.first_name + ' ' + el.last_name,
                    edit: false
               }));
                console.log('teacherList', this.teacherList);
            });

        this.store
            .select(selectSectionsByGradeId(this.gradeId))
            .subscribe((data) => {
                this.sectionList = data?.map((section: any) => ({
                    section_name: section.section_name,
                    id: section.id,
                    subjects: section.section_mappings?.length > 0  ? section.section_mappings.map((el) => ({
                        ...el.subject,
                        teacher: {
                            id: el.teacher.id,
                            name:
                                el.teacher.first_name +
                                ' ' +
                                el.teacher.last_name,
                            edit: false
                        },
                    })) : [],
                    editMode: false,
                }));
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    enterEditMode(element: any) {
        element.teacher = this.teacherList.find(t => t.id === element.teacher?.id) || null;
        element.teacher.edit = true;
    }


    openAddSectionModal() {
        this.matDialogRef = this._matDialog.open(this.EntityDialog, {
            width: '500px',
        });

        this.matDialogRef.afterClosed().subscribe((result) => {
            this.entityForm.enable();
            this.entityForm.reset();
        });
    }

    addSection() {
        // Return if the form is invalid
        if (this.entityForm.invalid) {
            return;
        }

        // Disable the form
        this.entityForm.disable();
        const formValues = this.entityForm.value;
        const requestObj: ISections = {
            section_name: formValues.name,
        };
        this.store.dispatch(
            SectionActions.addSection({
                gradeId: this.gradeId,
                section: requestObj,
            })
        );
    }

    deleteItem(item: ISections): void {
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
                    SectionActions.deleteSection({
                        gradeId: this.gradeId,
                        sectionId: item.id,
                    })
                );
            }
        });
    }

    onSectionNameModelChange(event, section: ISections) {
        this.newSectionName = event.trim();
    }

    updateSectionName(chapter: ISections) {
        const requestObj: ISections = {
            id: chapter.id,
            section_name: this.newSectionName,
        };
        this.store.dispatch(
            SectionActions.updateSection({
                gradeId: this.gradeId,
                section: requestObj,
            })
        );
    }

    toggleEditSection(section: ISections) {
        section.editMode = !section.editMode;
        if (section.editMode) {
            this.newSectionName = section.section_name;
        } else {
            this.newSectionName = '';
        }
    }

    addSubjectToSection(section: ISections) {
        const existingSubjectIds = new Set(section.subjects.map((s) => s.id));

        const duplicates = this.subjectForSections.filter((el) =>
            existingSubjectIds.has(el.id)
        );
        const newSubjects = this.subjectForSections
            .filter((el) => !existingSubjectIds.has(el.id))
            .map((el) => ({
                id: el.id,
                subject_name: el.subject_name,
                teacher: undefined,
                chapters: 0,
                completion: 0,
            }));

        console.log(newSubjects);

        const requestObj = {
            subject_id: newSubjects.map((el) => el.id),
            section_id: section.id
        };
        
        this._sectionService
            .assignSubjects(requestObj)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (response) => {
                    console.log(response);
                    // Add new subjects to the section
                    section.subjects = [...section.subjects, ...newSubjects];

                    // Clear selected subjects
                    this.subjectForSections = [];

                    // Notify if there were duplicates
                    if (duplicates.length > 0) {
                        const duplicateNames = duplicates
                            .map((d) => d.subject_name)
                            .join(', ');
                        this._snackBar.showError(
                            `Subjects already added: ${duplicateNames}`
                        );
                    }
                },
                (error) => {
                    this._snackBar.showError(
                            `Error: ${error?.message || 'Something went wrong.'}`
                        );
                }
            );
    }

    onTeacherAssign(event, subjectForSection, section) {
        if (subjectForSection.teacher) {
             subjectForSection.teacher.edit = false;
        }
        if (event.value) {

            const requestObj = {
                section_id: section.id,
                subject_id: subjectForSection.id,
                teacher_id: event.value.id,
            };

             this._sectionService
            .assignTeachers(requestObj)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (response) => {
                    console.log(response);
                    // subjectForSection.teacher = JSON.parse(
                    //     JSON.stringify(event.value)
                    // )
                },
                (error) => {
                    this._snackBar.showError(
                            `Error: ${error?.message || 'Something went wrong.'}`
                        );
                }
            );

            
        }
    }

    handleAPIResponse() {
        this.actions$
            .pipe(
                ofType(
                    GradeActions.loadGradesSuccess,
                    SubjectActions.loadSubjectsSuccess,
                    SubjectActions.loadSubjectsFailure,
                    SectionActions.addSectionSuccess,
                    SectionActions.addSectionFailure,
                    SectionActions.updateSectionSuccess,
                    SectionActions.updateSectionFailure,
                    SectionActions.deleteSectionSuccess,
                    SectionActions.deleteSectionFailure
                ),
                tap((action: any) => {
                    if (action.type === GradeActions.loadGradesSuccess.type) {
                        this.store
                            .select(
                                selectGradesByCurriculumId(this.curriculumId)
                            )
                            .pipe(
                                take(1),
                                map((grades) =>
                                    grades?.find((g) => g.id === this.gradeId)
                                ),
                                filter((grade) => !!grade)
                            )
                            .subscribe((grade) => {
                                this.gradeName = grade.grade_name;
                                this.titleService.setBreadcrumb([
                                    {
                                        label: this.translocoService.translate(
                                            'navigation.curriculum'
                                        ),
                                        url: 'school-structure',
                                    },
                                    {
                                        label: this.translocoService.translate(
                                            'navigation.schoolStructure'
                                        ),
                                        url: 'school-structure',
                                    },
                                    { label: grade.grade_name, url: '' },
                                ]);
                            });
                    }
                    if (
                        action.type ===
                            SubjectActions.loadSubjectsSuccess.type ||
                        action.type === SubjectActions.loadSubjectsFailure
                    ) {
                        this.isSubjectsLoading = false;
                    }

                    if (
                        action.type === SectionActions.addSectionSuccess.type ||
                        action.type === SectionActions.addSectionFailure.type ||
                        action.type ===
                            SectionActions.updateSectionSuccess.type ||
                        action.type === SectionActions.updateSectionFailure.type
                    ) {
                        this.matDialogRef?.close(true);
                    }

                    // Handle success
                    if (action.type === SectionActions.addSectionSuccess.type) {
                        this._snackBar.showSuccess(
                            this.translocoService.translate(
                                'school_structure.success_add'
                            )
                        );
                    } else if (
                        action.type === SectionActions.updateSectionSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                            this.translocoService.translate(
                                'school_structure.success_update'
                            )
                        );
                    } else if (
                        action.type === SectionActions.deleteSectionSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                            this.translocoService.translate(
                                'school_structure.success_delete'
                            )
                        );
                    }

                    // Handle failure
                    else if (
                        action.type === SectionActions.addSectionFailure.type ||
                        action.type ===
                            SectionActions.updateSectionFailure.type ||
                        action.type === SectionActions.deleteSectionFailure.type
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
