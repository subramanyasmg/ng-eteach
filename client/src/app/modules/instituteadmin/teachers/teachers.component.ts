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
import * as TeacherActions from 'app/state/teachers/teacher.actions';
import { selectAllTeachers } from 'app/state/teachers/teacher.selectors';
import { map, Observable, of, startWith, Subject, tap } from 'rxjs';

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
        'name',
        'subjectExpertise',
        'associatedClass',
        'actions',
    ];
    mode = null;
    query = '';
    entityForm: UntypedFormGroup;
    matDialogRef = null;
    licenseCount: number = 20;
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
    gradeList$: Observable<{ id: string; name: string }[]> = of([
        { id: 'g1', name: 'Grade 1' },
        { id: 'g2', name: 'Grade 2' },
        { id: 'g3', name: 'Grade 3' },
        { id: 'g4', name: 'Grade 4' },
    ]);
    sectionList$: Observable<{ id: string; name: string }[]> = of([
        { id: 'sec1', name: 'Section 1' },
        { id: 'sec2', name: 'Section 2' },
        { id: 'sec3', name: 'Section 3' },
        { id: 'sec4', name: 'Section 4' },
    ]);
    gradeSubjectList$: Observable<{ id: string; name: string }[]> = of([
        { id: 's1', name: 'Subject 1' },
        { id: 's2', name: 'Subject 2' },
        { id: 's3', name: 'Subject 3' },
        { id: 's4', name: 'Subject 4' },
    ]);

    gradeList: { id: string; name: string }[] = [];
    sectionList: { id: string; name: string }[] = [];
    subjectList: { id: string; name: string }[] = [];
    list$: Observable<ITeachers[]> = this.store.select(selectAllTeachers);
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _fuseConfirmationService: FuseConfirmationService,
        private _matDialog: MatDialog,
        private _formBuilder: UntypedFormBuilder,
        private _snackBar: SnackBarService,
        private store: Store,
        private actions$: Actions,
        private _cdr: ChangeDetectorRef,
        private titleService: BreadcrumbService,
        private translocoService: TranslocoService
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

        this.handleAPIResponse();

        this.list$.subscribe((data) => {
            this.dataSource = new MatTableDataSource(data); // reassign!
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
        });
    }

    ngOnInit(): void {
        this.entityForm = this._formBuilder.group({
            id: [''],
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            phone: [
                '',
                [
                    Validators.required,
                    Validators.minLength(10),
                    Validators.maxLength(15),
                    Validators.pattern(/^\+?[0-9]{10,15}$/),
                ],
            ],
            subjects: [[], [Validators.required]],
            grade: [''],
            section: [''],
            gradesubject: [''],
            selectedGradeSectionSubjects: [[], Validators.required],
        });

        this.filteredSubjects = this.subjectCtrl.valueChanges.pipe(
            startWith(''),
            map((value: string) => this._filterSubjects(value || ''))
        );

        // Cache the lists locally for lookup by ID
        this.gradeList$.subscribe((data) => (this.gradeList = data));
        this.sectionList$.subscribe((data) => (this.sectionList = data));
        this.gradeSubjectList$.subscribe((data) => (this.subjectList = data));
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
            name: data.name,
            email: data.email,
            phone: data.phone,
            subjects: JSON.parse(JSON.stringify(data.subjectExpertise)),
            selectedGradeSectionSubjects: JSON.parse(JSON.stringify(data.associatedClass))
        });
        this.selectedSubjects = JSON.parse(JSON.stringify(data.subjectExpertise));
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

    getRemainingGradeNames(grades: { grade: { name: string } }[]): string {
        if (grades.length <= 1) return '';
        return grades
            .slice(1) // skip the first
            .map((g) => g.grade.name)
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
            name: formValues.name,
            email: formValues.email,
            phone: formValues.phone,
            subjectExpertise: formValues.subjects,
            associatedClass: formValues.selectedGradeSectionSubjects,
        };
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
            name: formValues.name,
            email: formValues.email,
            phone: formValues.phone,
            subjectExpertise: formValues.subjects,
            associatedClass: formValues.selectedGradeSectionSubjects,
        };
        this.store.dispatch(TeacherActions.updateTeacher({ teacher: requestObj }));
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
                            `Error: ${action.error?.message || 'Something went wrong.'}`
                        );
                    }
                })
            )
            .subscribe();
    }
}
