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
import * as PublisherActions from 'app/state/publishers/publishers.actions';
import * as CurriculumActions from 'app/state/curriculum/curriculum.actions';
import * as InstituteActions from 'app/state/institute/institute.actions';
import {
    selectAllCurriculums,
    selectCurriculumsLoaded,
} from 'app/state/curriculum/curriculum.selectors';
import { selectAllInstitutes } from 'app/state/institute/institute.selectors';
import { filter, map, Observable, Subject, take, tap } from 'rxjs';
import { ICurriculum } from '../../../models/curriculum.types';
import { IInstitutes } from '../../../models/institutes.types';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { selectAllPublishers } from 'app/state/publishers/publishers.selectors';
import { IPublisher } from 'app/models/publisher.types';
import { CurriculumService } from 'app/services/curriculum.service';
import { subdomainAvailabilityValidator } from './subdomaincheck.validator';
import { InstituteService } from 'app/services/institute.service';

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
        'institute_name',
        'created_at',
        'expiresOn',
        'noOfLicense',
        'subdomain',
        'actions',
    ];
    mode = null;
    query = '';
    curriculumList$: Observable<ICurriculum[]>;
    publisherList$: Observable<IPublisher[]> = this.store.select(selectAllPublishers);
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
        private curriculumService: CurriculumService,
        private translocoService: TranslocoService,
        private instituteService: InstituteService
    ) {
        this.titleService.setBreadcrumb([
            { label: this.translocoService.translate('navigation.users'), url: 'manage-institute' },
            { label: this.translocoService.translate('navigation.manageInstitute'), url: '' },
        ]);
    }

    ngOnInit(): void {
        this.entityForm = this._formBuilder.group({
            id: [''],
            name: ['', [Validators.required]],
            noOfLicense: ['', [Validators.required]],
            instituteAddress: ['', [Validators.required]],
            phone: [
                '',
                [
                    Validators.required,
                    Validators.minLength(10),
                    Validators.maxLength(15),
                    Validators.pattern(/^\+?[0-9]{10,15}$/),
                ],
            ],
            adminName: ['', [Validators.required]],
            adminEmail: ['', [Validators.required, Validators.email]],
            subdomain: ['', [Validators.required]],
            expiresOn: ['', [Validators.required]],
            status: ['', [Validators.required]],
            curriculum: ['', [Validators.required]],
            publisher: ['', [Validators.required]],
        });


        this.store.dispatch(PublisherActions.loadPublishers());
        this.store.dispatch(InstituteActions.loadInstitutes());


        this.handleAPIResponse();

        this.list$.subscribe((data) => {
            this.dataSource = new MatTableDataSource(data); // reassign!
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
        });

        this.entityForm.get('publisher')?.valueChanges.subscribe((publisherId: string) => {
            if (publisherId) {
                this.entityForm.patchValue({ curriculum: '' });

                // Direct service call
                this.curriculumList$ = this.curriculumService.getAll(publisherId).pipe(
                    map((response: any) => response.data.rows ?? [])
                );
            }
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
        const subdomainControl = this.entityForm.get('subdomain');

        if (this.mode === 2) {
            subdomainControl?.clearAsyncValidators();
            subdomainControl?.disable();
            this.entityForm.get('adminEmail')?.disable();
            this.patchFormValues(selectedItem);
        } else {
            subdomainControl?.setAsyncValidators([subdomainAvailabilityValidator(this.instituteService)]);
            subdomainControl?.enable();
            this.entityForm.get('adminEmail')?.enable();
        }

        subdomainControl?.updateValueAndValidity();

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
            name: data.institute_name,
            noOfLicense: data.total_licenses,
            adminName: data.admin_name,
            instituteAddress: data.address,
            adminEmail: data.email,
            subdomain: data.subdomain,
            expiresOn: data.license_end,
            status: data.status,
            publisher: data.publisher_id,
            curriculum: data.curriculum_id
           // accountType: data.account_type
        });
    }

    addEntity() {
        // Return if the form is invalid
        if (this.entityForm.invalid) {
            return;
        }

        // Disable the form
        const formValues = this.entityForm.value;
        this.entityForm.disable();
        const requestObj: IInstitutes = {
            institute_name: formValues.name,
            total_licenses: formValues.noOfLicense,
            address: formValues.instituteAddress,
            admin_name: formValues.adminName,
            email: formValues.adminEmail,
            subdomain: formValues.subdomain,
            license_end: formValues.expiresOn,
            curriculum_id: formValues.curriculum,
            publisher_id: formValues.publisher,
            account_type: 'k12',
            phone: formValues.phone
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
            institute_name: formValues.name,
            total_licenses: formValues.noOfLicense,
            address: formValues.instituteAddress,
            admin_name: formValues.adminName,
            email: formValues.adminEmail,
            subdomain: formValues.subdomain,
            license_end: formValues.expiresOn,
            curriculum_id: Number(formValues.curriculum),
            account_type: 'k12',
            phone: formValues.phone
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
