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
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { SnackBarService } from 'app/core/general/snackbar.service';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';
import { PipesModule } from 'app/pipes/pipes.module';
import { selectAllCurriculums } from 'app/state/curriculum/curriculum.selectors';
import { selectGradesByCurriculumId } from 'app/state/grades/grades.selectors';
import * as SubjectActions from 'app/state/subjects/subjects.actions';
import {
    combineLatest,
    filter,
    map,
    Observable,
    Subject,
    take,
    tap,
} from 'rxjs';
import { ISubjects } from './subject.types';
import { selectSubjectsByGradeId, selectSubjectsLoaded } from 'app/state/subjects/subjects.selectors';

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
        RouterModule
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
        'noOfSubjects',
        'actions',
    ];
    mode = null;
    query = '';
    list$: Observable<ISubjects[]>;
    entityForm: UntypedFormGroup;
    matDialogRef = null;
    curriculumId;
    gradeId;
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
                this.titleService.setBreadcrumb([
                    { label: 'Curriculum', url: '/curriculum' },
                    { label: 'Manage Curriculum', url: '/curriculum' },
                    {
                        label: curriculum.name,
                        url: `/curriculum/${this.curriculumId}/grades`,
                    },
                    { label: grade.name, url: '' },
                ]);
            });

        this.entityForm = this._formBuilder.group({
            id: [''],
            name: ['', [Validators.required]],
        });

        this.list$ = this.store.select(selectSubjectsByGradeId(this.gradeId));

        this.store
            .select(selectSubjectsLoaded)
            .pipe(
                take(1),
                filter((loaded) => !loaded)
            )
            .subscribe(() => {
                this.store.dispatch(SubjectActions.loadSubjects({ gradeId: this.gradeId }));
            });

        this.handleAPIResponse();

        this.list$.subscribe((data) => {
            this.dataSource = new MatTableDataSource(data); // reassign!
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
        });
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
            width: '500px',
        });

        this.matDialogRef.afterClosed().subscribe((result) => {
            this.entityForm.enable();
            this.entityForm.reset();
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
            name: formValues.name,
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
                            `Subject "${action.subject.name}" added successfully!`
                        );
                    } else if (
                        action.type === SubjectActions.updateSubjectSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                            `Subject "${action.subject.name}" updated successfully!`
                        );
                    } else if (
                        action.type === SubjectActions.deleteSubjectSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                            `Subject deleted successfully!`
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
