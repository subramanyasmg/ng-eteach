import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';
import { CircleProgressComponent } from '../circle-progress/circle-progress.component';

@Component({
    selector: 'app-dashboard',
    imports: [TranslocoModule, CircleProgressComponent, CommonModule],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
    cardDataList = [
        {
            grade: 'Grade 1',
            section: 'Section A',
            subject: 'Math',
            completed: 10,
            total: 50,
            get progress() {
                return Math.round((this.completed / this.total) * 100);
            },
        },
        {
            grade: 'Grade 2',
            section: 'Section B',
            subject: 'Science',
            completed: 25,
            total: 40,
            get progress() {
                return Math.round((this.completed / this.total) * 100);
            },
        },
        {
            grade: 'Grade 3',
            section: 'Section C',
            subject: 'English',
            completed: 35,
            total: 50,
            get progress() {
                return Math.round((this.completed / this.total) * 100);
            },
        },
        {
            grade: 'Grade 4',
            section: 'Section D',
            subject: 'History',
            completed: 15,
            total: 30,
            get progress() {
                return Math.round((this.completed / this.total) * 100);
            },
        },
    ];

    constructor(
        private titleService: BreadcrumbService,
        private _router: Router,

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
}
