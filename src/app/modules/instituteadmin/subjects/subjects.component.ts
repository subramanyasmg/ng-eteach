import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    Component,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import {
    FormsModule,
    ReactiveFormsModule,
    UntypedFormGroup,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
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
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { Store } from '@ngrx/store';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';
import { ISubjects } from 'app/models/subject.types';
import { PipesModule } from 'app/pipes/pipes.module';
import * as GradeActions from 'app/state/grades/grades.actions';
import { selectGradesByCurriculumId } from 'app/state/grades/grades.selectors';
import * as SubjectActions from 'app/state/subjects/subjects.actions';
import { selectSubjectsByGradeId } from 'app/state/subjects/subjects.selectors';
import { filter, map, Observable, Subject, take } from 'rxjs';

@Component({
    selector: 'app-subjects',
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
        RouterModule,
        MatChipsModule,
        TranslocoModule,
    ],
    templateUrl: './subjects.component.html',
    styleUrl: './subjects.component.scss',
})
export class SubjectsComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('EntityDialog') EntityDialog: TemplateRef<any>;
    @ViewChild(MatPaginator) paginator!: MatPaginator;
    @ViewChild(MatSort) sort!: MatSort;

    dataSource = new MatTableDataSource<ISubjects>();
    displayedColumns: string[] = [
        'subject_name',
        'created_at',
        'updated_at',
        'chapter_count',
    ];
    mode = null;
    query = '';
    list$: Observable<ISubjects[]>;
    entityForm: UntypedFormGroup;
    matDialogRef = null;
    curriculumId = '1';
    gradeId;
    gradeName: string;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    separatorKeysCodes: number[] = [ENTER, COMMA];

    constructor(
        private route: ActivatedRoute,
        private store: Store,
        private translocoService: TranslocoService,
        private titleService: BreadcrumbService) {}

    ngOnInit(): void {
        this.gradeId = Number(this.route.snapshot.paramMap.get('id'));

        this.store.dispatch(
            GradeActions.loadGrades({ curriculumId: this.curriculumId })
        );

        setTimeout(() => {
            this.store
                .select(selectGradesByCurriculumId(this.curriculumId))
                .pipe(
                    take(1),
                    map((grades) => grades?.find((g) => g.id === this.gradeId)),
                    filter((grade) => !!grade)
                )
                .subscribe((grade) => {
                    this.gradeName = grade.grade_name;
                    this.titleService.setBreadcrumb([
                        {
                            label: this.translocoService.translate(
                                'navigation.curriculum'
                            ),
                            url: 'curriculum',
                        },
                        {
                            label: this.translocoService.translate(
                                'navigation.manageCurriculum'
                            ),
                            url: 'curriculum',
                        },
                        { label: grade.grade_name, url: '' },
                    ]);
                });
        }, 200);

        this.list$ = this.store.select(selectSubjectsByGradeId(this.gradeId));

        this.store.dispatch(
            SubjectActions.loadSubjects({ gradeId: this.gradeId })
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
