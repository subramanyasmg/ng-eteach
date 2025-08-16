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
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { USER_TYPES } from 'app/constants/usertypes';
import { SnackBarService } from 'app/core/general/snackbar.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';
import { PipesModule } from 'app/pipes/pipes.module';
import { CurriculumService } from 'app/services/curriculum.service';
import * as CurriculumActions from 'app/state/curriculum/curriculum.actions';
import { selectAllCurriculums } from 'app/state/curriculum/curriculum.selectors';
import { Observable, Subject, take, tap } from 'rxjs';
import { ICurriculum } from '../../../models/curriculum.types';

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
    @ViewChild('ExcelDialog') ExcelDialog: TemplateRef<any>;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    dataSource = new MatTableDataSource<ICurriculum>();
    displayedColumns: string[] = [
        'curriculum_name',
        'created_at',
        'updated_at',
        'actions',
    ];
    mode = null;
    query = '';
    list$: Observable<ICurriculum[]>;
    entityForm: UntypedFormGroup;
    matDialogRef = null;
    matDialogRefExcelUpload = null;
    publisherId;
    publisherName;
    user: User = null;
    readonly USER_TYPES = USER_TYPES;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    selectedExcelFile = null;

    constructor(
        private route: ActivatedRoute,
        private _fuseConfirmationService: FuseConfirmationService,
        private _matDialog: MatDialog,
        private _formBuilder: UntypedFormBuilder,
        private _snackBar: SnackBarService,
        private store: Store,
        private actions$: Actions,
        private _cdr: ChangeDetectorRef,
        private _userService: UserService,
        private translocoService: TranslocoService,
        private titleService: BreadcrumbService,
        private _curriculumService: CurriculumService
    ) {}

    ngOnInit(): void {
        // Check if the User Type is Publisher or Super Admin
        this._userService.user$.pipe(take(1)).subscribe((user: User) => {
            this.user = user;

            switch (this.user.type) {
                case USER_TYPES.SUPER_ADMIN:
                    {
                        this.publisherId = Number(
                            this.route.snapshot.paramMap.get('id')
                        );
                        this.publisherName = this.route.snapshot.paramMap.get('name');
                       
                        this.titleService.setBreadcrumb([
                            {
                                label: this.translocoService.translate(
                                    'navigation.curriculum'
                                ),
                                url: 'manage-publishers',
                            },
                            {
                                label: this.translocoService.translate(
                                    'navigation.managePublishers'
                                ),
                                url: 'manage-publishers',
                            },
                            {
                                label: this.publisherName,
                                url: '',
                            },
                        ]);
                        this.getAllCurriculums();
                       
                    }
                    break;
                case USER_TYPES.PUBLISHER_ADMIN:
                case USER_TYPES.PUBLISHER_USER:
                    {
                        this.publisherId = this.user.id;

                        this.titleService.setBreadcrumb([
                            {
                                label: this.translocoService.translate(
                                    'navigation.curriculum'
                                ),
                                url: 'manage-curriculum',
                            },
                            {
                                label: this.translocoService.translate(
                                    'navigation.manageCurriculum'
                                ),
                                url: '',
                            },
                        ]);
                        this.getAllCurriculums();
                    }
                    break;
            }
        });

        this.entityForm = this._formBuilder.group({
            id: [''],
            curriculum_name: ['', [Validators.required]],
        });

        this.handleAPIResponse();

        this.list$.subscribe((data) => {
            this.dataSource = new MatTableDataSource(data); // reassign!
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
        });
    }

    getAllCurriculums() {
        this.list$ = this.store.select(selectAllCurriculums(this.publisherId));

        this.store.dispatch(
            CurriculumActions.loadCurriculums({ publisherId: this.publisherId })
        );
    }

    ngAfterViewInit(): void {
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
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
            disableClose: true,
        });

        this.matDialogRef.afterClosed().subscribe((result) => {
            this.entityForm.enable();
            this.entityForm.reset();
        });
    }

    patchFormValues(data: ICurriculum) {
        this.entityForm.patchValue({
            id: data.id,
            curriculum_name: data.curriculum_name,
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
            curriculum_name: formValues.curriculum_name,
            publisher_id: this.publisherId,
        };
        this.store.dispatch(
            CurriculumActions.addCurriculum({
                publisherId: this.publisherId,
                curriculum: requestObj,
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
        const requestObj: ICurriculum = {
            id: formValues.id,
            curriculum_name: formValues.curriculum_name,
            publisher_id: this.publisherId,
        };
        this.store.dispatch(
            CurriculumActions.updateCurriculum({
                publisherId: this.publisherId,
                curriculum: requestObj,
            })
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
                    CurriculumActions.deleteCurriculum({
                        publisherId: this.publisherId,
                        curriculumId: item.id,
                    })
                );
            }
        });
    }

    openExcelUploadDialog() {
        this.matDialogRefExcelUpload = this._matDialog.open(this.ExcelDialog, {
            width: '500px',
        });

        this.matDialogRefExcelUpload.afterClosed().subscribe((result) => {
            this.selectedExcelFile = null;
        });
    }

    onFileSelected(event: Event) {
        const input = event.target as HTMLInputElement;
        const files = Array.from(input.files || []);
        if (files.length > 0) {
            this.selectedExcelFile = files[0];
        } else {
            this.selectedExcelFile = null;
        }
    }

    uploadExcelFile() {
        this._curriculumService
            .uploadExcelFile(this.selectedExcelFile, +this.publisherId)
            .subscribe({
                next: (res: any) => {
                    console.log('Upload success:', res);
                    if (res.success && res.status === 200) {
                        this._matDialog.closeAll();
                        this._snackBar.showSuccess(
                            this.translocoService.translate(
                                'curriculum.file_upload_success'
                            )
                        );
                    } else {
                        this._snackBar.showError(
                            this.translocoService.translate(
                                'curriculum.file_upload_error'
                            ) +
                                ' - ' +
                                res.message
                        );
                    }
                },
                error: (err) => {
                    console.error('Upload failed:', err);
                    this._snackBar.showError(
                        this.translocoService.translate(
                            'curriculum.file_upload_error'
                        )
                    );
                },
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
                    } else if (
                        action.type ===
                        CurriculumActions.updateCurriculumSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                            this.translocoService.translate(
                                'curriculum.success_update'
                            )
                        );
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
                            `Error: ${action.error?.error?.message || 'Something went wrong.'}`
                        );
                    }
                })
            )
            .subscribe();
    }
}
