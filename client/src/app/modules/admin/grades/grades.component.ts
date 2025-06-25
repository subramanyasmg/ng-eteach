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
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { SnackBarService } from 'app/core/general/snackbar.service';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';
import { PipesModule } from 'app/pipes/pipes.module';
import { selectAllCurriculums } from 'app/state/curriculum/curriculum.selectors';
import { filter, map, Observable, Subject, take, tap } from 'rxjs';
import { IGrades } from './grades.types';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Actions, ofType } from '@ngrx/effects';
import * as GradeActions from 'app/state/grades/grades.actions';
import { selectAllGrades, selectGradesLoaded } from 'app/state/grades/grades.selectors';

@Component({
    selector: 'app-grades',
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
    ],
    templateUrl: './grades.component.html',
    styleUrl: './grades.component.scss',
})
export class GradesListComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('EntityDialog') EntityDialog: TemplateRef<any>;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    dataSource = new MatTableDataSource<IGrades>();
    displayedColumns: string[] = [
        'name',
        'createdOn',
        'modifiedOn',
        'noOfSubjects',
        'actions',
    ];
    mode = null;
    query = '';
    list$: Observable<IGrades[]> = this.store.select(selectAllGrades);
    entityForm: UntypedFormGroup;
    matDialogRef = null;
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
        const id = this.route.snapshot.paramMap.get('id');

        this.store
            .select(selectAllCurriculums)
            .pipe(
                map((curriculums) => curriculums.find((c) => c.id === id)),
                filter(Boolean),
                take(1)
            )
            .subscribe((curriculum) => {
                this.titleService.setBreadcrumb([
                    { label: 'Curriculum', url: '/curriculum' },
                    { label: 'Manage Curriculum', url: '/curriculum' },
                    { label: curriculum.name, url: '' },
                ]);
            });

        this.entityForm = this._formBuilder.group({
            id: [''],
            name: ['', [Validators.required]],
        });
        this.store
            .select(selectGradesLoaded)
            .pipe(
                take(1),
                filter((loaded) => !loaded)
            )
            .subscribe(() => {
                this.store.dispatch(GradeActions.loadGrades());
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

    patchFormValues(data: IGrades) {
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
        const requestObj: IGrades = {
            name: formValues.name
        };
        this.store.dispatch(
            GradeActions.addGrade({ grade: requestObj })
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
        const requestObj: IGrades = {
            id: formValues.id,
            name: formValues.name
        };
        this.store.dispatch(
            GradeActions.updateGrade({ grade: requestObj })
        );
    }

    deleteItem(item: IGrades): void {
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
                    GradeActions.deleteGrade({ id: item.id })
                );
            }
        });
    }

    handleAPIResponse() {
        this.actions$
            .pipe(
                ofType(
                    GradeActions.addGradeSuccess,
                    GradeActions.addGradeFailure,
                    GradeActions.updateGradeSuccess,
                    GradeActions.updateGradeFailure,
                    GradeActions.deleteGradeSuccess,
                    GradeActions.deleteGradeFailure
                ),
                tap((action: any) => {
                    // Close dialog on add/update success/failure
                    if (
                        action.type ===
                            GradeActions.addGradeSuccess.type ||
                        action.type ===
                            GradeActions.addGradeFailure.type ||
                        action.type ===
                            GradeActions.updateGradeSuccess.type ||
                        action.type ===
                            GradeActions.updateGradeFailure.type
                    ) {
                        this.matDialogRef?.close(true);
                    }

                    // Handle success
                    if (
                        action.type ===
                        GradeActions.addGradeSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                            `Grade "${action.grade.name}" added successfully!`
                        );
                    } else if (
                        action.type ===
                        GradeActions.updateGradeSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                            `Grade "${action.grade.name}" updated successfully!`
                        );
                    } else if (
                        action.type ===
                        GradeActions.deleteGradeSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                            `Grade deleted successfully!`
                        );
                    }

                    // Handle failure
                    else if (
                        action.type ===
                            GradeActions.addGradeFailure.type ||
                        action.type ===
                            GradeActions.updateGradeFailure.type ||
                        action.type ===
                            GradeActions.deleteGradeFailure.type
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
