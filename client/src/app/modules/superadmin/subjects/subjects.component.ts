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
    FormsModule,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
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
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { SnackBarService } from 'app/core/general/snackbar.service';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';
import { PipesModule } from 'app/pipes/pipes.module';
import * as CurriculumActions from 'app/state/curriculum/curriculum.actions';
import { selectAllCurriculums } from 'app/state/curriculum/curriculum.selectors';
import * as GradeActions from 'app/state/grades/grades.actions';
import { selectGradesByCurriculumId } from 'app/state/grades/grades.selectors';
import * as SubjectActions from 'app/state/subjects/subjects.actions';
import { selectSubjectsByGradeId } from 'app/state/subjects/subjects.selectors';
import {
    combineLatest,
    filter,
    map,
    Observable,
    Subject,
    take,
    tap,
} from 'rxjs';
import { ISubjects } from '../../../models/subject.types';

@Component({
    selector: 'app-subjects',
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
        PipesModule,
        MatSortModule,
        MatSelectModule,
        RouterModule,
        MatChipsModule,
        TranslocoModule,
    ],
    templateUrl: './subjects.component.html',
    styleUrl: './subjects.component.scss',
})
export class SubjectsListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('EntityDialog') EntityDialog: TemplateRef<any>;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    dataSource = new MatTableDataSource<ISubjects>();
    displayedColumns: string[] = [
        'name',
        'createdOn',
        'modifiedOn',
        'noOfChapters',
        'actions',
    ];
    mode = null;
    query = '';
    list$: Observable<ISubjects[]>;
    entityForm: UntypedFormGroup;
    matDialogRef = null;
    curriculumId;
    gradeId;
    gradeName: string;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    separatorKeysCodes: number[] = [ENTER, COMMA];

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
        private titleService: BreadcrumbService
    ) {}

    ngOnInit(): void {
        this.store.dispatch(CurriculumActions.loadCurriculums());

        this.curriculumId = Number(this.route.snapshot.paramMap.get('cid'));
        this.gradeId = Number(this.route.snapshot.paramMap.get('gid'));

        this.store.dispatch(
            GradeActions.loadGrades({ curriculumId: this.curriculumId })
        );

        setTimeout(() => {
            combineLatest([
                this.store.select(selectAllCurriculums),
                this.store.select(selectGradesByCurriculumId(this.curriculumId)),
            ])
                .pipe(
                    take(1),
                    map(([curriculums, grades]) => {
                        const curriculum = curriculums.find(
                            (c) => c.id === this.curriculumId
                        );
                        const grade = grades?.find((g) => g.id === this.gradeId);
                        return { curriculum, grade };
                    }),
                    filter(({ curriculum, grade }) => !!curriculum && !!grade)
                )
                .subscribe(({ curriculum, grade }) => {
                    this.gradeName = grade.name;
                    this.titleService.setBreadcrumb([
                        {
                            label: this.translocoService.translate(
                                'navigation.curriculum'
                            ),
                            url: '/curriculum',
                        },
                        {
                            label: this.translocoService.translate(
                                'navigation.manageCurriculum'
                            ),
                            url: '/curriculum',
                        },
                        {
                            label: curriculum.name,
                            url: `/curriculum/${this.curriculumId}/grades`,
                        },
                        { label: grade.name, url: '' },
                    ]);
                });
        }, 1000);


        this.entityForm = this._formBuilder.group({
            id: [''],
            name: [''],
            subjects: [[]],
        });

        this.list$ = this.store.select(selectSubjectsByGradeId(this.gradeId));

        this.store.dispatch(
            SubjectActions.loadSubjects({ gradeId: this.gradeId })
        );

        this.handleAPIResponse();

        this.list$.subscribe((data) => {
            this.dataSource = new MatTableDataSource(data); // reassign!
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
        });
    }

    get subjects() {
        return this.entityForm.get('subjects');
    }

    addSubject(event: MatChipInputEvent): void {
        const input = event.input;
        const value = event.value?.trim();

        if (value) {
            const currentSubjects = this.subjects.value || [];

            // Check for duplicates (case-insensitive)
            const isDuplicate = currentSubjects.some(
                (subject) => subject.toLowerCase() === value.toLowerCase()
            );

            if (!isDuplicate) {
                this.subjects.setValue([...currentSubjects, value]);
            } else {
                this._snackBar.showError(
                    this.translocoService.translate(
                        'subjects.error_subject_exists',
                        { name: value }
                    )
                );
            }
        }

        // Clear the input
        if (input) {
            input.value = '';
        }
    }

    removeSubject(index: number): void {
        const updated = [...this.subjects.value];
        updated.splice(index, 1);
        this.subjects.setValue(updated);
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
            this.entityForm.get('name')?.setValidators([Validators.required]);
            this.entityForm.get('subjects')?.clearValidators();
            this.patchFormValues(selectedItem);
        } else {
            this.entityForm
                .get('subjects')
                ?.setValidators([Validators.required]);
            this.entityForm.get('name')?.clearValidators();
        }
        this.matDialogRef = this._matDialog.open(this.EntityDialog, {
            width: '500px',
        });

        this.matDialogRef.afterClosed().subscribe((result) => {
            this.entityForm.enable();
            this.entityForm.reset({
                subjects: [],
            });
        });
    }

    patchFormValues(data: ISubjects) {
        this.entityForm.patchValue({
            id: data.id,
            name: data.name,
        });
    }

    addEntity() {
        // Return if the form is invalid
        if (this.entityForm.invalid) {
            return;
        }

        // Disable the form
        this.entityForm.disable();
        const formValues = this.entityForm.value;
        const requestObj: ISubjects = {
            name: formValues.subjects.join(','),
        };
        this.store.dispatch(
            SubjectActions.addSubject({
                gradeId: this.gradeId,
                subject: requestObj,
            })
        );
    }

    updateEntity() {
        // Return if the form is invalid
        if (this.entityForm.invalid) {
            return;
        }

        // Disable the form
        this.entityForm.disable();
        const formValues = this.entityForm.value;
        const requestObj: ISubjects = {
            id: formValues.id,
            name: formValues.name,
        };
        this.store.dispatch(
            SubjectActions.updateSubject({
                gradeId: this.gradeId,
                subject: requestObj,
            })
        );
    }

    deleteItem(item: ISubjects): void {
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
                    SubjectActions.deleteSubject({
                        gradeId: this.gradeId,
                        subjectId: item.id,
                    })
                );
            }
        });
    }

    handleAPIResponse() {
        this.actions$
            .pipe(
                ofType(
                    SubjectActions.addSubjectSuccess,
                    SubjectActions.addSubjectFailure,
                    SubjectActions.updateSubjectSuccess,
                    SubjectActions.updateSubjectFailure,
                    SubjectActions.deleteSubjectSuccess,
                    SubjectActions.deleteSubjectFailure
                ),
                tap((action: any) => {
                    // Close dialog on add/update success/failure
                    if (
                        action.type === SubjectActions.addSubjectSuccess.type ||
                        action.type === SubjectActions.addSubjectFailure.type ||
                        action.type ===
                            SubjectActions.updateSubjectSuccess.type ||
                        action.type === SubjectActions.updateSubjectFailure.type
                    ) {
                        this.matDialogRef?.close(true);
                    }

                    // Handle success
                    if (action.type === SubjectActions.addSubjectSuccess.type) {
                        this._snackBar.showSuccess(
                            this.translocoService.translate(
                                'subjects.success_add'
                            )
                        );
                    } else if (
                        action.type === SubjectActions.updateSubjectSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                            this.translocoService.translate(
                                'subjects.success_update'
                            )
                        );
                    } else if (
                        action.type === SubjectActions.deleteSubjectSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                            this.translocoService.translate(
                                'subjects.success_delete'
                            )
                        );
                    }

                    // Handle failure
                    else if (
                        action.type === SubjectActions.addSubjectFailure.type ||
                        action.type ===
                            SubjectActions.updateSubjectFailure.type ||
                        action.type === SubjectActions.deleteSubjectFailure.type
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
