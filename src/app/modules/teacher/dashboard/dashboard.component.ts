import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { SnackBarService } from 'app/core/general/snackbar.service';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';
import { ClassesService } from 'app/services/classes.service';
import { DashboardService } from 'app/services/dashboard.service';
import { Subject, takeUntil } from 'rxjs';
import { CircleProgressComponent } from '../circle-progress/circle-progress.component';

@Component({
    selector: 'app-dashboard',
    imports: [TranslocoModule, CircleProgressComponent, CommonModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
    // cardDataList = [
    //     {
    //         grade_name: 'Grade 1',
    //         section_name: 'Section A',
    //         subject_name: 'Math',
    //         completed: 10,
    //         total: 50,
    //         get progress() {
    //             return Math.round((this.completed / this.total) * 100);
    //         },
    //     },
    //     {
    //         grade_name: 'Grade 2',
    //         section_name: 'Section B',
    //         subject_name: 'Science',
    //         completed: 25,
    //         total: 40,
    //         get progress() {
    //             return Math.round((this.completed / this.total) * 100);
    //         },
    //     },
    //     {
    //         grade_name: 'Grade 3',
    //         section_name: 'Section C',
    //         subject_name: 'English',
    //         completed: 35,
    //         total: 50,
    //         get progress() {
    //             return Math.round((this.completed / this.total) * 100);
    //         },
    //     },
    //     {
    //         grade_name: 'Grade 4',
    //         section_name: 'Section D',
    //         subject_name: 'History',
    //         completed: 15,
    //         total: 30,
    //         get progress() {
    //             return Math.round((this.completed / this.total) * 100);
    //         },
    //     },
    // ];

    cardDataList = [];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private titleService: BreadcrumbService,
        private _router: Router,
        private _dashboardService: DashboardService,
        private _classesService: ClassesService,
        private _snackBar: SnackBarService,
        private translocoService: TranslocoService
    ) {
        this.titleService.setBreadcrumb([
            {
                label: this.translocoService.translate('navigation.platform'),
                url: 'my-dashboard',
            },
            {
                label: this.translocoService.translate('navigation.dashboard'),
                url: '',
            },
        ]);
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        this._dashboardService
            .getTeacherDashboard()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (response: any) => {
                    console.log('response', response);
                    if (response.success && response.data) {
                        this.cardDataList = response.data;
                    } else {
                        this._snackBar.showError(
                            this.translocoService.translate(
                                'teacher_dashboard.error_data_fetch'
                            )
                        );
                    }
                },
                (error) => {
                    this._snackBar.showError(
                        this.translocoService.translate(
                            'teacher_dashboard.error_data_fetch'
                        ) +
                            ' - ' +
                            error?.message
                    );
                }
            );
    }
}
