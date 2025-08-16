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
import { Store } from '@ngrx/store';
import { SnackBarService } from 'app/core/general/snackbar.service';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';
import { PipesModule } from 'app/pipes/pipes.module';
import { selectAllCurriculums } from 'app/state/curriculum/curriculum.selectors';
import { combineLatest, filter, map, Observable, Subject, take, tap } from 'rxjs';
import { IGrades } from '../../../models/grades.types';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Actions, ofType } from '@ngrx/effects';
import * as PublisherActions from 'app/state/publishers/publishers.actions';
import * as GradeActions from 'app/state/grades/grades.actions';
import * as CurriculumActions from 'app/state/curriculum/curriculum.actions';
import { selectGradesByCurriculumId, selectGradesLoaded } from 'app/state/grades/grades.selectors';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { selectAllPublishers } from 'app/state/publishers/publishers.selectors';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { USER_TYPES } from 'app/constants/usertypes';

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
        PipesModule,
        MatSortModule,
        MatSelectModule,
        RouterModule,
        TranslocoModule
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
        'grade_name',
        'created_at',
        'updated_at',
        'subject_count',
        'actions',
    ];
    mode = null;
    query = '';
    list$: Observable<IGrades[]>;
    entityForm: UntypedFormGroup;
    matDialogRef = null;
    curriculumId;
    publisherId;
    publisherName;
    curriculumName;
    user:User = null;
    readonly USER_TYPES = USER_TYPES;
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
        private _userService: UserService,
        private translocoService: TranslocoService,
        private titleService: BreadcrumbService
    ) {}

    ngOnInit(): void {
         // Check if the User Type is Publisher or Super Admin
        this._userService.user$.pipe(take(1)).subscribe((user: User) => {
            this.user = user;

            switch (this.user.type) {
                case USER_TYPES.SUPER_ADMIN: {

                    this.curriculumId = Number(this.route.snapshot.paramMap.get('cid'));
                    this.publisherId = Number(this.route.snapshot.paramMap.get('pid'));
                    this.publisherName = this.route.snapshot.paramMap.get('pname');
                    this.curriculumName = this.route.snapshot.paramMap.get('cname');

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
                            url: `manage-publishers/${this.publisherId}/${this.publisherName}/curriculum`,
                        },
                        { label: this.curriculumName, url: '' },
                    ]);

                    this.loadGradesForCurriculum();
                }
                break;
                case USER_TYPES.PUBLISHER_ADMIN:
                case USER_TYPES.PUBLISHER_USER: {

                    this.curriculumId = Number(this.route.snapshot.paramMap.get('cid'));
                    this.publisherId = this.user.id;
                    this.curriculumName = this.route.snapshot.paramMap.get('cname');

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
                            url: 'manage-curriculum',
                        },
                        { label:  this.curriculumName, url: '' },
                    ]);
                    this.loadGradesForCurriculum();
                }
                break;
            }
        });

        this.entityForm = this._formBuilder.group({
            id: [''],
            name: ['', [Validators.required]],
        });

        this.handleAPIResponse();

        this.list$.subscribe((data) => {
            this.dataSource = new MatTableDataSource(data); // reassign!
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
        });
    }

    loadGradesForCurriculum() {
        this.list$ = this.store.select(selectGradesByCurriculumId(this.curriculumId));
        this.store.dispatch(GradeActions.loadGrades({ curriculumId: this.curriculumId }));
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
            disableClose: true
        });

        this.matDialogRef.afterClosed().subscribe((result) => {
            this.entityForm.enable();
            this.entityForm.reset();
        });
    }

    patchFormValues(data: IGrades) {
        this.entityForm.patchValue({
            id: data.id,
            name: data.grade_name,
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
            grade_name: formValues.name
        };
        this.store.dispatch(
            GradeActions.addGrade({ curriculumId: this.curriculumId, grade: requestObj })
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
            grade_name: formValues.name
        };
        this.store.dispatch(
            GradeActions.updateGrade({ curriculumId: this.curriculumId, grade: requestObj })
        );
    }

    deleteItem(item: IGrades): void {
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
                    GradeActions.deleteGrade({ curriculumId: this.curriculumId, gradeId: item.id })
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
                           this.translocoService.translate('grades.success_add')
                        );
                    } else if (
                        action.type ===
                        GradeActions.updateGradeSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                           this.translocoService.translate('grades.success_update')
                        );
                    } else if (
                        action.type ===
                        GradeActions.deleteGradeSuccess.type
                    ) {
                        this._snackBar.showSuccess(
                            this.translocoService.translate('grades.success_delete')
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
                            `Error: ${action.error?.error?.message || 'Something went wrong.'}`
                        );
                    }
                })
            )
            .subscribe();
    }
}

