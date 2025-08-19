import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import {
    FormControl,
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatOptionModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { SnackBarService } from 'app/core/general/snackbar.service';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';
import { ITeachers } from 'app/models/teachers.types';
import { GradesService } from 'app/services/grades.service';
import { SectionsService } from 'app/services/sections.service';
import { SecureSessionStorageService } from 'app/services/securestorage.service';
import { SubjectsService } from 'app/services/subjects.service';
import { TeachersService } from 'app/services/teachers.service';
import * as TeacherActions from 'app/state/teachers/teacher.actions';
import { selectAllTeachers } from 'app/state/teachers/teacher.selectors';
import { map, Observable, startWith, Subject, takeUntil, tap } from 'rxjs';

@Component({
    selector: 'app-teachers',
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
        MatTooltipModule,
        MatDatepickerModule,
        TranslocoModule,
        MatAutocompleteModule,
        MatChipsModule,
        MatOptionModule,
    ],
    templateUrl: './teachers.component.html',
    styleUrl: './teachers.component.scss',
})
export class TeachersComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('EntityDialog') EntityDialog: TemplateRef<any>;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    dataSource = new MatTableDataSource<ITeachers>();
    displayedColumns: string[] = [
        'first_name',
        // 'subjectExpertise',
        'associatedClass',
        'actions',
    ];
    mode = null;
    query = '';
    entityForm: UntypedFormGroup;
    matDialogRef = null;
    licenseCount: number = 0;
    disableAddTeacher = false;
    subjectCtrl = new FormControl('');
    separatorKeysCodes: number[] = [ENTER, COMMA];
    selectedSubjects: { id: string; name: string }[] = [];
    allSubjects: { id: string; name: string }[] = [
        { id: 'math101', name: 'Mathematics' },
        { id: 'sci102', name: 'Science' },
        { id: 'hist103', name: 'History' },
        { id: 'geo104', name: 'Geography' },
        { id: 'eng105', name: 'English' },
        { id: 'phy106', name: 'Physics' },
        { id: 'chem107', name: 'Chemistry' },
        { id: 'bio108', name: 'Biology' },
    ];
    filteredSubjects!: Observable<{ id: string; name: string }[]>;

    gradeList: { id: string; name: string }[] = [];
    sectionList: { id: string; name: string }[] = [];
    subjectList: { id: string; name: string }[] = [];
    list$: Observable<ITeachers[]> = this.store.select(selectAllTeachers);
    emailVerificationInProgress = false;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _fuseConfirmationService: FuseConfirmationService,
        private _matDialog: MatDialog,
        private _formBuilder: UntypedFormBuilder,
        private _snackBar: SnackBarService,
        private _gradeService: GradesService,
        private _sectionService: SectionsService,
        private _subjectService: SubjectsService,
        private _teacherService: TeachersService,
        private store: Store,
        private actions$: Actions,
        private _cdr: ChangeDetectorRef,
        private titleService: BreadcrumbService,
        private translocoService: TranslocoService,
        private _secureStorageService: SecureSessionStorageService
    ) {
        this.titleService.setBreadcrumb([
            {
                label: this.translocoService.translate('navigation.users'),
                url: '/institute/teachers',
            },
            {
                label: this.translocoService.translate(
                    'navigation.manageTeachers'
                ),
                url: '',
            },
        ]);

        this.licenseCount = (
            this._secureStorageService.getItem('license') as any
        ).total_licenses;

        this.store.dispatch(TeacherActions.loadTeachers());

        this.handleAPIResponse();

        this.list$.subscribe((data) => {
            console.log(data);
            const mappedData = data.map((el: any) => ({
                ...el,
                associatedClass: el.section_mappings?.map((el2) => ({
                    grade: {
                        id: el2.section.grade.id,
                        name: el2.section.grade.grade_name,
                    },
                    section: {
                        id: el2.section.id,
                        name: el2.section.section_name,
                    },
                    subject: {
                        id: el2.section_subject.id,
                        name: el2.section_subject.subject_name,
                    },
                })),
            }));
            console.log('mappedData', mappedData);
            this.dataSource = new MatTableDataSource(mappedData); // reassign!
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;

            if (mappedData.length >= this.licenseCount) {
                this.disableAddTeacher = true;
            }
        });
    }

    ngOnInit(): void {
        this.entityForm = this._formBuilder.group({
            id: [''],
            fname: [
                '',
                [
                    Validators.required,
                    Validators.pattern(/^[A-Za-z]+$/), // only alphabets
                ],
            ],
            lname: [
                '',
                [
                    Validators.required,
                    Validators.pattern(/^[A-Za-z]+$/), // only alphabets
                ],
            ],
            email: ['', [Validators.required, Validators.email]],
            phone: [
                '',
                [
                    Validators.required,
                    Validators.pattern(/^[0-9]{10}$/), // exactly 10 digits
                ],
            ],
            //  subjects: [[], [Validators.required]],
            //grade: [''],
            //section: [''],
            //gradesubject: [''],
            //selectedGradeSectionSubjects: [[]],
        });

        this.filteredSubjects = this.subjectCtrl.valueChanges.pipe(
            startWith(''),
            map((value: string) => this._filterSubjects(value || ''))
        );

        this._gradeService
            .getAll('1')
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((response) => {
                console.log(response);
                if (response.success && response.data?.rows) {
                    this.gradeList = response.data.rows.map((el) => ({
                        id: el.id,
                        name: el.grade_name,
                    }));
                }
            });

        this.entityForm
            .get('grade')
            ?.valueChanges.subscribe((gradeId: string) => {
                if (gradeId) {
                    this.entityForm.patchValue({ section: '' });
                    this.entityForm.patchValue({ gradesubject: '' });

                    this._sectionService
                        .getAll(gradeId)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((response) => {
                            console.log('sections', response);
                            if (response.success && response.data?.rows) {
                                this.sectionList = response.data.rows.map(
                                    (el) => ({
                                        id: el.id,
                                        name: el.section_name,
                                    })
                                );
                            }
                        });

                    this._subjectService
                        .getAll(gradeId)
                        .pipe(takeUntil(this._unsubscribeAll))
                        .subscribe((response) => {
                            console.log('subjects', response);
                            if (response.success && response.data?.rows) {
                                this.subjectList = response.data.rows.map(
                                    (el) => ({
                                        id: el.id,
                                        name: el.subject_name,
                                    })
                                );
                            }
                        });
                }
            });
    }

    private _filterSubjects(value: string): { id: string; name: string }[] {
        const filterValue = value.toLowerCase();
        return this.allSubjects.filter(
            (subject) =>
                subject.name.toLowerCase().includes(filterValue) &&
                !this.selectedSubjects.find((s) => s.id === subject.id)
        );
    }

    selectSubject(event: any): void {
        const selectedName = event.option.value;
        const subject = this.allSubjects.find((s) => s.name === selectedName);
        if (
            subject &&
            !this.selectedSubjects.find((s) => s.id === subject.id)
        ) {
            this.selectedSubjects.push(subject);
            this.entityForm.get('subjects')?.setValue(this.selectedSubjects);
        }
        this.subjectCtrl.setValue('');
    }

    removeSubject(subject: { id: string; name: string }): void {
        const index = this.selectedSubjects.findIndex(
            (s) => s.id === subject.id
        );
        if (index >= 0) {
            this.selectedSubjects.splice(index, 1);
            this.entityForm.get('subjects')?.setValue(this.selectedSubjects);
        }
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this._cdr.detectChanges();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    applyFilter(): void {
        const filterValue = this.query?.trim().toLowerCase() || '';
        this.dataSource.filter = filterValue;
    }

    openDialog(mode, selectedItem = null) {
        this.mode = mode;

        if (this.mode === 2) {
            this.patchFormValues(selectedItem);
        }
        this.matDialogRef = this._matDialog.open(this.EntityDialog, {
            width: '600px',
            disableClose: true,
        });

        this.matDialogRef.afterClosed().subscribe((result) => {
            this.entityForm.reset();
            this.selectedSubjects = [];
            this.entityForm.get('subjects')?.setValue([]);
            this.entityForm.get('selectedGradeSectionSubjects')?.setValue([]);
            this.entityForm.enable();
        });
    }

    patchFormValues(data: ITeachers) {
        this.entityForm.patchValue({
            id: data.id,
            fname: data.first_name,
            lname: data.last_name,
            email: data.email,
            phone: data.phone,
            // subjects: JSON.parse(JSON.stringify(data.subjectExpertise)),
            // selectedGradeSectionSubjects: JSON.parse(
            //     JSON.stringify(data.associatedClass)
            // ),
        });
        // this.selectedSubjects = JSON.parse(
        //     JSON.stringify(data.subjectExpertise)
        // );
    }

    addSelectedGrade(): void {
        const selectedGrades = this.entityForm.get(
            'selectedGradeSectionSubjects'
        )?.value;
        const gradeId = this.entityForm.get('grade')?.value;
        const sectionId = this.entityForm.get('section')?.value;
        const subjectId = this.entityForm.get('gradesubject')?.value;

        const grade = this.gradeList.find((g) => g.id === gradeId);
        const section = this.sectionList.find((s) => s.id === sectionId);
        const subject = this.subjectList.find((sub) => sub.id === subjectId);

        if (grade && section && subject) {
            const isDuplicate = selectedGrades.some(
                (el) =>
                    el.grade.id === grade.id &&
                    el.section.id === section.id &&
                    el.subject.id === subject.id
            );

            if (isDuplicate) {
                this._snackBar.showError(
                    this.translocoService.translate(
                        'teachers.error_duplicate_combination'
                    )
                );
                return; // Prevent duplicate entry
            }

            selectedGrades.push({ grade, section, subject });
            this.entityForm
                .get('selectedGradeSectionSubjects')
                ?.setValue([...selectedGrades]);

            this.entityForm.patchValue({
                grade: '',
                section: '',
                gradesubject: '',
            });

            this.entityForm.markAsUntouched(); // Optional: Clear validation states
        }
    }

    removeSelectedGrade(index: number): void {
        const selectedGrades = this.entityForm.get(
            'selectedGradeSectionSubjects'
        )?.value;
        selectedGrades.splice(index, 1);
        this.entityForm
            .get('selectedGradeSectionSubjects')
            ?.setValue([...selectedGrades]);
    }

    getRemainingGradeNames(classes: any[]): string {
        if (classes.length <= 1) return '';
        return classes
            .slice(1) // skip the first
            .map(
                (c) =>
                    c.grade.name +
                    ' - ' +
                    c.section.name +
                    ' - ' +
                    c.subject.name
            )
            .join(', ');
    }

    addEntity() {
        // Return if the form is invalid
        if (this.entityForm.invalid) {
            return;
        }

        // Disable the form
        this.entityForm.disable();
        const formValues = this.entityForm.value;
        const requestObj: ITeachers = {
            first_name: formValues.fname,
            last_name: formValues.lname,
            email: formValues.email,
            phone: formValues.phone,
        };
        // if (formValues.selectedGradeSectionSubjects) {
        //     requestObj.associatedClass =
        //         formValues.selectedGradeSectionSubjects?.map((el) => ({
        //             grade_id: el.grade.id,
        //             section_id: el.section.id,
        //             subject_id: el.subject.id,
        //         }));
        // }
        this.store.dispatch(TeacherActions.addTeacher({ teacher: requestObj }));
    }

    updateEntity() {
        // Return if the form is invalid
        if (this.entityForm.invalid) {
            return;
        }

        // Disable the form
        this.entityForm.disable();
        const formValues = this.entityForm.value;
        const requestObj: ITeachers = {
            id: formValues.id,
            first_name: formValues.fname,
            last_name: formValues.lname,
            email: formValues.email,
            phone: formValues.phone,
            // subjectExpertise: formValues.subjects,
            //associatedClass: formValues.selectedGradeSectionSubjects,
        };
        this.store.dispatch(
            TeacherActions.updateTeacher({ teacher: requestObj })
        );
    }

    deleteItem(item: ITeachers): void {
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
                    TeacherActions.deleteTeacher({ id: item.id })
                );
            }
        });
    }

    resendEmailVerification(element) {
        const requestObj = {
            id: element.id,
            email: element.email,
        };
        this.emailVerificationInProgress = true;
        this._teacherService.resendVerificationEmail(requestObj).subscribe(
            (response: any) => {
                this.emailVerificationInProgress = false;
                console.log(response);
                if (response.success && response.status === 200) {
                    this._snackBar.showSuccess(
                        this.translocoService.translate(
                            'teachers.email_verification_success'
                        )
                    );
                } else {
                    this._snackBar.showError(
                        this.translocoService.translate(
                            'teachers.email_verification_error'
                        )
                    );
                }
            },
            (error) => {
                this.emailVerificationInProgress = false;
                console.error(error);
                this._snackBar.showError(
                    this.translocoService.translate(
                        'teachers.email_verification_error'
                    )
                );
            }
        );
    }

    handleAPIResponse() {
        this.actions$
            .pipe(
                ofType(
                    TeacherActions.addTeacherSuccess,
                    TeacherActions.addTeacherFailure,
                    TeacherActions.updateTeacherSuccess,
                    TeacherActions.updateTeacherFailure,
                    TeacherActions.deleteTeacherSuccess,
                    TeacherActions.deleteTeacherFailure
                ),
                tap((action: any) => {
                    // Close dialog on add/update success/failure
                    if (
                        action.type === TeacherActions.addTeacherSuccess.type ||
                        action.type === TeacherActions.addTeacherFailure.type ||
                        action.type ===
                            TeacherActions.updateTeacherSuccess.type ||
                        action.type === TeacherActions.updateTeacherFailure.type
                    ) {
                        this.matDialogRef?.close(true);
                    }

                    // Handle success
                    if (action.type === TeacherActions.addTeacherSuccess.type) {
                        this._snackBar.showSuccess(
                            this.translocoService.translate(
                                'teachers.success_add'
                            )
                        );
                    } else if (
                        action.type === TeacherActions.updateTeacherSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                            this.translocoService.translate(
                                'teachers.success_update'
                            )
                        );
                    } else if (
                        action.type === TeacherActions.deleteTeacherSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                            this.translocoService.translate(
                                'teachers.success_delete'
                            )
                        );
                    }

                    // Handle failure
                    else if (
                        action.type === TeacherActions.addTeacherFailure.type ||
                        action.type ===
                            TeacherActions.updateTeacherFailure.type ||
                        action.type === TeacherActions.deleteTeacherFailure.type
                    ) {
                        this._snackBar.showError(
                            `Error: ${action.error?.error?.message || 'Something went wrong.'}`
                        );
                    }
                })
            )
            .subscribe();
    }
}
