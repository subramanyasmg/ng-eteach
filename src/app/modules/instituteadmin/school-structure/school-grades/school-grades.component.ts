import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormGroup,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
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
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Store } from '@ngrx/store';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';
import { IGrades } from 'app/models/grades.types';
import { PipesModule } from 'app/pipes/pipes.module';
import * as GradeActions from 'app/state/grades/grades.actions';
import { selectGradesByCurriculumId } from 'app/state/grades/grades.selectors';
import { Observable, Subject } from 'rxjs';

@Component({
    selector: 'app-school-grades',
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
        MatButtonToggleModule,
        PipesModule,
        MatSortModule,
        MatSelectModule,
        RouterModule,
        TranslocoModule,
    ],
    templateUrl: './school-grades.component.html',
    styleUrl: './school-grades.component.scss',
})
export class SchoolGradesComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    dataSource = new MatTableDataSource<IGrades>();
    displayedColumns: string[] = [
        'grade_name',
        'created_at',
        'updated_at',
        'subject_count',
        'section_count'
    ];
    mode = null;
    query = '';
    list$: Observable<IGrades[]>;
    entityForm: UntypedFormGroup;
    matDialogRef = null;
    curriculumId = '1';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private store: Store,
        private translocoService: TranslocoService,
        private titleService: BreadcrumbService
    ) {}

    ngOnInit(): void {
        this.titleService.setBreadcrumb([
            {
                label: this.translocoService.translate('navigation.curriculum'),
                url: 'curriculum',
            },
            {
                label: this.translocoService.translate(
                    'navigation.manageCurriculum'
                ),
                url: 'curriculum',
            },
        ]);

        this.list$ = this.store.select(
            selectGradesByCurriculumId(this.curriculumId)
        );
        this.store.dispatch(
            GradeActions.loadGrades({ curriculumId: this.curriculumId })
        );

        this.list$.subscribe((data) => {
            this.dataSource = new MatTableDataSource(data); // reassign!
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
        });
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
}
