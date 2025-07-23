import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { SnackBarService } from 'app/core/general/snackbar.service';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';
import { ChaptersService } from 'app/services/chapters.service';
import { QuillModule } from 'ngx-quill';

@Component({
    selector: 'app-chapter-details',
    imports: [
        CommonModule,
        TranslocoModule,
        MatTabsModule,
        MatIconModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule,
        MatSelectModule,
        QuillModule,
        MatExpansionModule,
        MatSnackBarModule,
        MatTooltipModule,
    ],
    templateUrl: './chapter-details.component.html',
    styleUrl: './chapter-details.component.scss',
})
export class ChapterDetailsComponent implements OnInit {
    selectedChapter = {
        name: 'Chapter Name',
        lessonPlan: null,
        textBook: [],
        referenceMaterials: [],
    };
    selectedGrade = 'Grade 1 - Section A - Math';
    gradeId;
    chapterId;
    chapterStatus = 'in-progress';
    phases: [] = [];
    constructor(
        private route: ActivatedRoute,
        private _snackBar: SnackBarService,
        private translocoService: TranslocoService,
        private titleService: BreadcrumbService,
        private _chapterService: ChaptersService
    ) {}

    ngOnInit(): void {
        this.gradeId = Number(this.route.snapshot.paramMap.get('id'));
        this.chapterId = Number(this.route.snapshot.paramMap.get('cid'));

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
            {
                label: this.selectedGrade,
                url: `manage-classes/${this.gradeId}/chapters`,
            },
            {
                label: this.selectedChapter.name,
                url: '',
            },
        ]);
        this.getAllPhases();
    }

    getAllPhases() {
        this._chapterService.phases$.subscribe(
            (response: any) => {
                if (response) {
                    this.phases = response.map((el: any) => ({
                        label: el.name,
                        content: null,
                        id: el.id,
                        edit: false
                    }));
                    this.selectedChapter.lessonPlan = this.clonePhases(
                       this.selectedChapter.lessonPlan ?? this.phases
                    );
                } else {
                    this._snackBar.showError(
                        this.translocoService.translate(
                            'chapters.no_phases_available'
                        )
                    );
                }
            },
            (error) => {
                this._snackBar.showError(
                    this.translocoService.translate(
                        'chapters.phase_server_error'
                    )
                );
            }
        );
    }

    clonePhases(phases: any[]): any[] {
        return phases.map((phase) => ({ ...phase }));
    }

    onFileDrop(chapter, event: DragEvent, type) {
        event.preventDefault();
        const files = Array.from(event.dataTransfer?.files || []);
        this.addFiles(chapter, files, type);
    }

    onDragOver(chapter, event: DragEvent, type) {
        event.preventDefault();
    }

    onDragLeave(chapter, event: DragEvent, type) {
        event.preventDefault();
    }

    onFileSelected(chapter, event: Event, type) {
        const input = event.target as HTMLInputElement;
        const files = Array.from(input.files || []);
        this.addFiles(chapter, files, type);
    }

    addFiles(chapter, files: File[], type) {
        type === 1
            ? (chapter.textBook = [...files])
            : chapter.referenceMaterials.push(...files);
    }
}
