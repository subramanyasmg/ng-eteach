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
import { IPublisher } from 'app/models/publisher.types';
import { PipesModule } from 'app/pipes/pipes.module';
import * as PublisherActions from 'app/state/publishers/publishers.actions';
import { selectAllPublishers } from 'app/state/publishers/publishers.selectors';
import { Observable, Subject, tap } from 'rxjs';

@Component({
    selector: 'app-publishers-list',
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
    templateUrl: './publishers-list.component.html',
    styleUrl: './publishers-list.component.scss',
})
export class PublishersListComponent
    implements OnInit, AfterViewInit, OnDestroy
{
    @ViewChild('EntityDialog') EntityDialog: TemplateRef<any>;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    dataSource = new MatTableDataSource<IPublisher>();
    displayedColumns: string[] = [
        'publication_name',
        'name',
        'email',
        'phone',
        'actions',
    ];
    mode = null;
    query = '';
    list$: Observable<IPublisher[]> = this.store.select(selectAllPublishers);
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
                url: 'manage-publishers',
            },
            {
                label: this.translocoService.translate(
                    'navigation.managePublishers'
                ),
                url: '',
            },
        ]);
    }

    ngOnInit(): void {
        this.entityForm = this._formBuilder.group({
            id: [''],
            contact_name: ['', [Validators.required]],
            publication_name: ['', [Validators.required]],
            address: ['', [Validators.required]],
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
        });

        this.getAllPublishers();
        this.handleAPIResponse();

        this.list$.subscribe((data) => {
            this.dataSource = new MatTableDataSource(data); // reassign!
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
        });
    }

    getAllPublishers() {
        this.store.dispatch(PublisherActions.loadPublishers());
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
            this.entityForm.get('email')?.disable();
        } else {
            this.entityForm.get('email')?.enable();
        }
        this.matDialogRef = this._matDialog.open(this.EntityDialog, {
            width: '500px',
        });

        this.matDialogRef.afterClosed().subscribe((result) => {
            this.entityForm.enable();
            this.entityForm.reset();
        });
    }

    patchFormValues(data: IPublisher) {
        this.entityForm.patchValue({
            id: data.id,
            publication_name: data.publication_name,
            contact_name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
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
        const requestObj: IPublisher = {
            publication_name: formValues.publication_name,
            name: formValues.contact_name,
            email: formValues.email,
            phone: formValues.phone,
            address: formValues.address,
        };
        this.store.dispatch(
            PublisherActions.addPublisher({ publisher: requestObj })
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
        const requestObj: IPublisher = {
            id: formValues.id,
            publication_name: formValues.publication_name,
            name: formValues.contact_name,
            email: formValues.email,
            phone: formValues.phone,
            address: formValues.address,
        };
        this.store.dispatch(
            PublisherActions.updatePublisher({ publisher: requestObj })
        );
    }

    deleteItem(item: IPublisher): void {
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
                    PublisherActions.deletePublisher({ id: item.id })
                );
            }
        });
    }

    handleAPIResponse() {
        this.actions$
            .pipe(
                ofType(
                    PublisherActions.addPublisherSuccess,
                    PublisherActions.addPublisherFailure,
                    PublisherActions.updatePublisherSuccess,
                    PublisherActions.updatePublisherFailure,
                    PublisherActions.deletePublisherSuccess,
                    PublisherActions.deletePublisherFailure
                ),
                tap((action: any) => {
                    // Close dialog on add/update success/failure
                    if (
                        action.type ===
                            PublisherActions.addPublisherSuccess.type ||
                        action.type ===
                            PublisherActions.addPublisherFailure.type ||
                        action.type ===
                            PublisherActions.updatePublisherSuccess.type ||
                        action.type ===
                            PublisherActions.updatePublisherFailure.type
                    ) {
                        this.matDialogRef?.close(true);
                    }

                    // Handle success
                    if (
                        action.type ===
                        PublisherActions.addPublisherSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                            this.translocoService.translate(
                                'publisher.success_add'
                            )
                        );
                        this.getAllPublishers();
                    } else if (
                        action.type ===
                        PublisherActions.updatePublisherSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                            this.translocoService.translate(
                                'publisher.success_update'
                            )
                        );
                        this.getAllPublishers();
                    } else if (
                        action.type ===
                        PublisherActions.deletePublisherSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                            this.translocoService.translate(
                                'publisher.success_delete'
                            )
                        );
                    }

                    // Handle failure
                    else if (
                        action.type ===
                            PublisherActions.addPublisherFailure.type ||
                        action.type ===
                            PublisherActions.updatePublisherFailure.type ||
                        action.type ===
                            PublisherActions.deletePublisherFailure.type
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
