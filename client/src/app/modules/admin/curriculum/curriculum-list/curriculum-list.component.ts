import { AsyncPipe, CommonModule, NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit
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
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { SnackBarService } from 'app/core/general/snackbar.service';
import { PipesModule } from 'app/pipes/pipes.module';
import {
    addCurriculum,
    addCurriculumFailure,
    addCurriculumSuccess,
    loadCurriculums,
} from 'app/state/curriculum/curriculum.actions';
import {
    selectAllCurriculums,
    selectCurriculumsLoaded,
} from 'app/state/curriculum/curriculum.selectors';
import { filter, Observable, Subject, take, tap } from 'rxjs';
import { ICurriculum } from '../curriculum.types';
import { CurriculumService } from './curriculum.service';

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
        NgTemplateOutlet,
        MatPaginatorModule,
        MatRippleModule,
        MatProgressSpinnerModule,
        AsyncPipe,
        MatSnackBarModule,
        MatTooltipModule,
        MatTabsModule,
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        PipesModule,
    ],
    templateUrl: './curriculum-list.component.html',
    styleUrl: './curriculum-list.component.scss',
})
export class CurriculumListComponent
    implements OnInit, OnDestroy
{

    query = '';
    list$: Observable<ICurriculum[]> = this.store.select(selectAllCurriculums);
    entityForm: UntypedFormGroup;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private route: ActivatedRoute,
        private _changeDetectorRef: ChangeDetectorRef,
        private _fuseConfirmationService: FuseConfirmationService,
        private _matDialog: MatDialog,
        private _formBuilder: UntypedFormBuilder,
        private _snackBar: SnackBarService,
        private store: Store,
        private actions$: Actions,
        private _curriculumService: CurriculumService
    ) {}

    ngOnInit(): void {
        this.entityForm = this._formBuilder.group({
            id: [''],
            name: ['', [Validators.required]],
        });
        this.store
            .select(selectCurriculumsLoaded)
            .pipe(
                take(1),
                filter((loaded) => !loaded)
            )
            .subscribe(() => {
                this.store.dispatch(loadCurriculums());
            });

        this.handleAPIResponse();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    addNewCurriculum() {
        const newCurriculum = {
            id: Date.now().toString(),
            name: 'New Curriculum',
            createdOn: new Date().toLocaleDateString(),
            publisherName: 'Kishan Gandhi',
            publisherEmail: 'kishan@example.com',
            phone: '+91 98765 43210',
        };

        this.store.dispatch(addCurriculum({ curriculum: newCurriculum }));
    }

    openDialog(mode, selectedItem = null) {
        this.addNewCurriculum();
    }

    handleAPIResponse() {
        this.actions$
            .pipe(
                ofType(addCurriculumSuccess),
                tap(({ curriculum }) => {
                    this._snackBar.showSuccess(
                        `Curriculum "${curriculum.name}" added successfully!`
                    );
                })
            )
            .subscribe();

        this.actions$
            .pipe(
                ofType(addCurriculumFailure),
                tap(({ error }) => {
                    this._snackBar.showError(
                        `Error: ${error.message || 'Failed to add curriculum.'}`
                    );
                })
            )
            .subscribe();
    }
}
