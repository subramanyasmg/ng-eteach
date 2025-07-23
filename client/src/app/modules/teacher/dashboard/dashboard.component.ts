import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { CircleProgressComponent } from '../circle-progress/circle-progress.component';
import { CommonModule } from '@angular/common';

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
}
