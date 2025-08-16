import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { SnackBarService } from 'app/core/general/snackbar.service';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';
import { DashboardService } from 'app/services/dashboard.service';
import { OrganizationChartModule } from 'primeng/organizationchart';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-dashboard',
    imports: [
        CommonModule,
        MatIconModule,
        MatButtonModule,
        TranslocoModule,
        OrganizationChartModule,
    ],
    standalone: true,
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
    count = {
        total_grades: 0,
        total_teachers: 0,
    }
    data: any[] = [
        {
            label: 'MySchool',
            styleClass: '!bg-blue-600 !text-white !text-2xl !font-bold',
            type: 'root',
            expanded: true,
            children: [
                {
                    label: 'G1',
                    styleClass: '!bg-blue-100 !text-blue-900',
                    expanded: false,
                    children: [
                        {
                            label: 'Sec A',
                            expanded: false,
                            styleClass: '!bg-purple-100 !text-purple-900',
                            children: [
                                {
                                    label: 'Sub1 - Teacher - 14/18 - 40%',
                                    styleClass: '!bg-green-100 !text-green-900',
                                },
                                {
                                    label: 'Sub2 - Teacher - 8/10 - 60%',
                                    styleClass: '!bg-green-100 !text-green-900',
                                },
                            ],
                        },
                        {
                            label: 'Sec B',
                            expanded: false,
                            styleClass: '!bg-purple-100 !text-purple-900',
                            children: [
                                {
                                    label: 'Sub1 - Teacher - 10/12 - 80%',
                                    styleClass: '!bg-green-100 !text-green-900',
                                },
                            ],
                        },
                    ],
                },
                {
                    label: 'G2',
                    expanded: false,
                    styleClass: '!bg-blue-100 !text-blue-900',
                    children: [
                        {
                            label: 'Sec A',
                            expanded: false,
                            styleClass: '!bg-purple-100 !text-purple-900',
                            children: [
                                {
                                    label: 'Sub1 - Teacher - 12/15 - 70%',
                                    styleClass: '!bg-green-100 !text-green-900',
                                },
                            ],
                        },
                    ],
                },
                {
                    label: 'G10',
                    expanded: false,
                    styleClass: '!bg-blue-100 !text-blue-900',
                    children: [
                        {
                            label: 'Sec A',
                            expanded: false,
                            styleClass: '!bg-purple-100 !text-purple-900',
                            children: [
                                {
                                    label: 'Sub1 - Teacher - 5/10 - 50%',
                                    styleClass: '!bg-green-100 !text-green-900',
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ];

    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private titleService: BreadcrumbService,
        private _router: Router,
        private _dashboardService: DashboardService,
        private _snackBar: SnackBarService,
        private translocoService: TranslocoService
    ) {
        this.titleService.setBreadcrumb([
            {
                label: this.translocoService.translate('navigation.platform'),
                url: 'dashboard',
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
            .getInstituteAdminDashboard()
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (response) => {
                    console.log('response', response);
                    if (response.success && response.data) {
                        this.count.total_grades = response.data.total_grades;
                        this.count.total_teachers = response.data.total_teachers;
                    } else {
                        this._snackBar.showError(
                            this.translocoService.translate(
                                'insadmin_dashboard.error_data_fetch'
                            )
                        );
                    }
                },
                (error) => {
                    this._snackBar.showError(
                        this.translocoService.translate(
                            'insadmin_dashboard.error_data_fetch'
                        ) + ' - ' + error?.message
                    );
                }
            );
    }
}
