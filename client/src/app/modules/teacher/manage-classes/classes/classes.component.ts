import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';

@Component({
  selector: 'app-classes',
  imports: [
    TranslocoModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    RouterModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './classes.component.html',
  styleUrl: './classes.component.scss'
})
export class ClassesComponent implements OnInit {

   query = '';
    cardDataList = [
        {
            id: '1',
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
            id: '2',
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
            id: '3',
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
            id: '4',
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
        private route: ActivatedRoute,
        private translocoService: TranslocoService,
        private titleService: BreadcrumbService
    ) {}

    ngOnInit(): void {
        this.titleService.setBreadcrumb([
            {
                label: this.translocoService.translate('navigation.curriculum'),
                url: 'manage-classes',
            },
            {
                label: this.translocoService.translate(
                    'navigation.manageClasses'
                ),
                url: 'manage-classes',
            },
        ]);
    }

    get filteredList() {
        if (!this.query) {
            return this.cardDataList;
        }

        const lowerQuery = this.query.toLowerCase();

        return this.cardDataList.filter((chapter) =>
            chapter.grade?.toLowerCase().includes(lowerQuery)
        );
    }
}
