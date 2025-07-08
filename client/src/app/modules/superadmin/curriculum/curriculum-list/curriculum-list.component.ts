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
import { RouterModule } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { SnackBarService } from 'app/core/general/snackbar.service';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';
import { PipesModule } from 'app/pipes/pipes.module';
import * as CurriculumActions from 'app/state/curriculum/curriculum.actions';
import { selectAllCurriculums } from 'app/state/curriculum/curriculum.selectors';
import { Observable, Subject, tap } from 'rxjs';
import { ICurriculum } from '../../../../models/curriculum.types';

@Component({
    selector: 'app-curriculum-list',
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
        RouterModule,
        ReactiveFormsModule,
        PipesModule,
        MatSortModule,
        MatSelectModule,
        TranslocoModule,
    ],
    templateUrl: './curriculum-list.component.html',
    styleUrl: './curriculum-list.component.scss',
})
export class CurriculumListComponent
    implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild('EntityDialog') EntityDialog: TemplateRef<any>;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    dataSource = new MatTableDataSource<ICurriculum>();
    displayedColumns: string[] = [
        'name',
        'createdOn',
        'publisherName',
        'publisherEmail',
        'phone',
        'actions',
    ];
    mode = null;
    query = '';
    list$: Observable<ICurriculum[]> = this.store.select(selectAllCurriculums);
    entityForm: UntypedFormGroup;
    matDialogRef = null;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _fuseConfirmationService: FuseConfirmationService,
        private _matDialog: MatDialog,
        private _formBuilder: UntypedFormBuilder,
        private _snackBar: SnackBarService,
        private store: Store,
        private actions$: Actions,
        private _cdr: ChangeDetectorRef,
        private translocoService: TranslocoService,
        private titleService: BreadcrumbService
    ) {
        this.titleService.setBreadcrumb([
            {
                label: this.translocoService.translate('navigation.curriculum'),
                url: '/curriculum',
            },
            {
                label: this.translocoService.translate(
                    'navigation.manageCurriculum'
                ),
                url: '',
            },
        ]);
    }

    ngOnInit(): void {
        this.entityForm = this._formBuilder.group({
            id: [''],
            name: ['', [Validators.required]],
            publisherName: ['', [Validators.required]],
            publisherEmail: ['', [Validators.required, Validators.email]],
            phone: [
                '',
                [
                    Validators.required,
                    Validators.minLength(10),
                    Validators.maxLength(15),
                    Validators.pattern(/^\+?[0-9]{10,15}$/),
                ],
            ],
        });

        this.getAllCurriculums();
        this.handleAPIResponse();

        this.list$.subscribe((data) => {
            this.dataSource = new MatTableDataSource(data); // reassign!
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
        });
    }

    getAllCurriculums() {
        this.store.dispatch(CurriculumActions.loadCurriculums());
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

    patchFormValues(data: ICurriculum) {
        this.entityForm.patchValue({
            id: data.id,
            name: data.name,
            publisherName: data.publisherName,
            publisherEmail: data.publisherEmail,
            phone: data.phone,
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
        const requestObj: ICurriculum = {
            name: formValues.name,
            publisherName: formValues.publisherName,
            publisherEmail: formValues.publisherEmail,
            phone: formValues.phone,
        };
        this.store.dispatch(
            CurriculumActions.addCurriculum({ curriculum: requestObj })
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
        const requestObj: ICurriculum = {
            id: formValues.id,
            name: formValues.name,
            publisherName: formValues.publisherName,
            publisherEmail: formValues.publisherEmail,
            phone: formValues.phone,
        };
        this.store.dispatch(
            CurriculumActions.updateCurriculum({ curriculum: requestObj })
        );
    }

    deleteItem(item: ICurriculum): void {
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
                    CurriculumActions.deleteCurriculum({ id: item.id })
                );
            }
        });
    }

    handleAPIResponse() {
        this.actions$
            .pipe(
                ofType(
                    CurriculumActions.addCurriculumSuccess,
                    CurriculumActions.addCurriculumFailure,
                    CurriculumActions.updateCurriculumSuccess,
                    CurriculumActions.updateCurriculumFailure,
                    CurriculumActions.deleteCurriculumSuccess,
                    CurriculumActions.deleteCurriculumFailure
                ),
                tap((action: any) => {
                    // Close dialog on add/update success/failure
                    if (
                        action.type ===
                            CurriculumActions.addCurriculumSuccess.type ||
                        action.type ===
                            CurriculumActions.addCurriculumFailure.type ||
                        action.type ===
                            CurriculumActions.updateCurriculumSuccess.type ||
                        action.type ===
                            CurriculumActions.updateCurriculumFailure.type
                    ) {
                        this.matDialogRef?.close(true);
                    }

                    // Handle success
                    if (
                        action.type ===
                        CurriculumActions.addCurriculumSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                            this.translocoService.translate(
                                'curriculum.success_add'
                            )
                        );
                       this.getAllCurriculums();
                    } else if (
                        action.type ===
                        CurriculumActions.updateCurriculumSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                            this.translocoService.translate(
                                'curriculum.success_update'
                            )
                        );
                        this.getAllCurriculums();
                    } else if (
                        action.type ===
                        CurriculumActions.deleteCurriculumSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                            this.translocoService.translate(
                                'curriculum.success_delete'
                            )
                        );
                    }

                    // Handle failure
                    else if (
                        action.type ===
                            CurriculumActions.addCurriculumFailure.type ||
                        action.type ===
                            CurriculumActions.updateCurriculumFailure.type ||
                        action.type ===
                            CurriculumActions.deleteCurriculumFailure.type
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
