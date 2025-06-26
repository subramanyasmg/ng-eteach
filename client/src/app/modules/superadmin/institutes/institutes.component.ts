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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { SnackBarService } from 'app/core/general/snackbar.service';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';
import { filter, Observable, Subject, take } from 'rxjs';
import { IInstitutes } from './institutes.types';
import { selectAllCurriculums, selectCurriculumsLoaded } from 'app/state/curriculum/curriculum.selectors';
import { ICurriculum } from '../curriculum/curriculum.types';
import * as CurriculumActions from 'app/state/curriculum/curriculum.actions';
import {provideNativeDateAdapter} from '@angular/material/core';

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
        'publisherName',
        'publisherEmail',
        'phone',
        'actions',
    ];
    mode = null;
    query = '';
    curriculumList$: Observable<ICurriculum[]> = this.store.select(selectAllCurriculums);
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
        private titleService: BreadcrumbService
    ) {
        this.titleService.setBreadcrumb([
            { label: 'Users', url: '/institute' },
            { label: 'Manage Institutes', url: '' },
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

        // this.handleAPIResponse();

        // this.list$.subscribe((data) => {
        //     this.dataSource = new MatTableDataSource(data); // reassign!
        //     this.dataSource.sort = this.sort;
        //     this.dataSource.paginator = this.paginator;
        // });
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
        // this.entityForm.patchValue({
        //     id: data.id,
        //     name: data.name,
        //     publisherName: data.publisherName,
        //     publisherEmail: data.publisherEmail,
        //     phone: data.phone,
        // });
    }
}
