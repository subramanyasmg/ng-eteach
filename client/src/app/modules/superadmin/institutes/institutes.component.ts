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
import {
    MatRippleModule,
    provideNativeDateAdapter,
} from '@angular/material/core';
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
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { SnackBarService } from 'app/core/general/snackbar.service';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';
import * as CurriculumActions from 'app/state/curriculum/curriculum.actions';
import * as InstituteActions from 'app/state/institute/institute.actions';
import {
    selectAllCurriculums,
    selectCurriculumsLoaded,
} from 'app/state/curriculum/curriculum.selectors';
import { selectAllInstitutes } from 'app/state/institute/institute.selectors';
import { filter, Observable, Subject, take, tap } from 'rxjs';
import { ICurriculum } from '../../../models/curriculum.types';
import { IInstitutes } from '../../../models/institutes.types';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

@Component({
    selector: 'app-institutes',
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
        TranslocoModule
    ],
    providers: [provideNativeDateAdapter()],
    templateUrl: './institutes.component.html',
    styleUrl: './institutes.component.scss',
})
export class InstitutesComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('EntityDialog') EntityDialog: TemplateRef<any>;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    dataSource = new MatTableDataSource<IInstitutes>();
    displayedColumns: string[] = [
        'name',
        'createdOn',
        'expiresOn',
        'noOfLicense',
        'subdomain',
        'actions',
    ];
    mode = null;
    query = '';
    curriculumList$: Observable<ICurriculum[]> =
        this.store.select(selectAllCurriculums);
    list$: Observable<IInstitutes[]> = this.store.select(selectAllInstitutes);
    entityForm: UntypedFormGroup;
    matDialogRef = null;
    today: Date = new Date();
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
            { label: this.translocoService.translate('navigation.users'), url: '/institute' },
            { label: this.translocoService.translate('navigation.manageInstitute'), url: '' },
        ]);
    }

    ngOnInit(): void {
        this.entityForm = this._formBuilder.group({
            id: [''],
            name: ['', [Validators.required]],
            noOfLicense: ['', [Validators.required]],
            instituteAddress: ['', [Validators.required]],
            adminName: ['', [Validators.required]],
            adminEmail: ['', [Validators.required, Validators.email]],
            subdomain: ['', [Validators.required]],
            expiresOn: ['', [Validators.required]],
            status: ['', [Validators.required]],
            curriculum: ['', [Validators.required]],
            accountType: ['', [Validators.required]],
        });

        this.store
            .select(selectCurriculumsLoaded)
            .pipe(
                take(1),
                filter((loaded) => !loaded)
            )
            .subscribe(() => {
                this.store.dispatch(CurriculumActions.loadCurriculums());
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
            width: '600px',
        });

        this.matDialogRef.afterClosed().subscribe((result) => {
            this.entityForm.enable();
            this.entityForm.reset();
        });
    }

    patchFormValues(data: IInstitutes) {
        this.entityForm.patchValue({
            id: data.id,
            name: data.name,
            noOfLicense: data.noOfLicense,
            adminName: data.adminName,
            instituteAddress: data.instituteAddress,
            adminEmail: data.adminEmail,
            subdomain: data.subdomain,
            expiresOn: data.expiresOn,
            status: data.status,
            curriculum: data.curriculum,
            accountType: data.accountType
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
        const requestObj: IInstitutes = {
            name: formValues.name,
            noOfLicense: formValues.noOfLicense,
            instituteAddress: formValues.instituteAddress,
            adminName: formValues.adminName,
            adminEmail: formValues.adminEmail,
            subdomain: formValues.subdomain,
            expiresOn: formValues.expiresOn,
            status: formValues.status,
            curriculum: formValues.curriculum,
            accountType: formValues.accountType,
        };
        this.store.dispatch(
            InstituteActions.addInstitute({ institute: requestObj })
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
        const requestObj: IInstitutes = {
            id: formValues.id,
            name: formValues.name,
            noOfLicense: formValues.noOfLicense,
            instituteAddress: formValues.instituteAddress,
            adminName: formValues.adminName,
            adminEmail: formValues.adminEmail,
            subdomain: formValues.subdomain,
            expiresOn: formValues.expiresOn,
            status: formValues.status,
            curriculum: formValues.curriculum,
            accountType: formValues.accountType,
        };
        this.store.dispatch(
            InstituteActions.updateInstitute({ institute: requestObj })
        );
    }

    deleteItem(item: IInstitutes): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: this.translocoService.translate('common.deleteConfirmationTitle'),
            message:this.translocoService.translate('common.deleteConfirmationMessage'),
            actions: {
                confirm: {
                    label: this.translocoService.translate('common.deletePermanently'),
                },
            },
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {
            // If the confirm button pressed...
            if (result === 'confirmed') {
                this.store.dispatch(
                    InstituteActions.deleteInstitute({ id: item.id })
                );
            }
        });
    }

    handleAPIResponse() {
        this.actions$
            .pipe(
                ofType(
                    InstituteActions.addInstituteSuccess,
                    InstituteActions.addInstituteFailure,
                    InstituteActions.updateInstituteSuccess,
                    InstituteActions.updateInstituteFailure,
                    InstituteActions.deleteInstituteSuccess,
                    InstituteActions.deleteInstituteFailure
                ),
                tap((action: any) => {
                    // Close dialog on add/update success/failure
                    if (
                        action.type ===
                            InstituteActions.addInstituteSuccess.type ||
                        action.type ===
                            InstituteActions.addInstituteFailure.type ||
                        action.type ===
                            InstituteActions.updateInstituteSuccess.type ||
                        action.type ===
                            InstituteActions.updateInstituteFailure.type
                    ) {
                        this.matDialogRef?.close(true);
                    }

                    // Handle success
                    if (
                        action.type ===
                        InstituteActions.addInstituteSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                            this.translocoService.translate('institute.success_add')
                        );
                    } else if (
                        action.type ===
                        InstituteActions.updateInstituteSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                            this.translocoService.translate('institute.success_update')
                        );
                    } else if (
                        action.type ===
                        InstituteActions.deleteInstituteSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                             this.translocoService.translate('institute.success_delete')
                        );
                    }

                    // Handle failure
                    else if (
                        action.type ===
                            InstituteActions.addInstituteFailure.type ||
                        action.type ===
                            InstituteActions.updateInstituteFailure.type ||
                        action.type ===
                            InstituteActions.deleteInstituteFailure.type
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
