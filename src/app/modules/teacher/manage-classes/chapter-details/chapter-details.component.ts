import { CommonModule } from '@angular/common';
import {
    Component,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { FuseConfirmationService } from '@fuse/services/confirmation';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { SnackBarService } from 'app/core/general/snackbar.service';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';
import { IChapters } from 'app/models/chapters.types';
import { ChaptersService } from 'app/services/chapters.service';
import { QuillModule } from 'ngx-quill';
import { Subject, takeUntil } from 'rxjs';

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
export class ChapterDetailsComponent implements OnInit, OnDestroy {
    @ViewChild('filePreviewModal') filePreviewModal: TemplateRef<any>;

    selectedChapter: IChapters = {};
    selectedGrade = '';
    sectionMappingId;
    chapterId;
    matDialogRef = null;
    readonly CHAPTER_STATUS = {
        IN_PROGRESS: 'INPROGRESS',
        COMPLETED: 'COMPLETED',
        NOT_STARTED: 'NOTSTARTED',
    };
    chapterStatus = this.CHAPTER_STATUS.IN_PROGRESS;
    phases: [] = [];
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private route: ActivatedRoute,
        private _snackBar: SnackBarService,
        private translocoService: TranslocoService,
        private titleService: BreadcrumbService,
        private sanitizer: DomSanitizer,
        private _matDialog: MatDialog,
        private _chapterService: ChaptersService,
        private _fuseConfirmationService: FuseConfirmationService
    ) {}

    ngOnInit(): void {
        this.sectionMappingId = Number(this.route.snapshot.paramMap.get('id'));
        this.chapterId = Number(this.route.snapshot.paramMap.get('cid'));
        this.selectedGrade = this.route.snapshot.paramMap.get('name');
        this.getAllPhases();
        this.getChapterDetails();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }

    getAllPhases() {
        this._chapterService.phases$.subscribe(
            (response: any) => {
                if (response) {
                    this.phases = response.map((el: any) => ({
                        label: el.name,
                        content: null,
                        id: el.id,
                        edit: false,
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

    generateBreadcrumb() {
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
                url: `manage-classes/${this.sectionMappingId}/chapters`,
            },
            {
                label: this.selectedChapter.title,
                url: '',
            },
        ]);
    }

    getChapterDetails(): void {
        this.selectedChapter.isLoading = true;
        this._chapterService
            .getChapterDetails(null, this.chapterId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (response: any) => {
                    console.log('response', response);

                    if (response.success && response.status === 200) {
                        this.selectedChapter.id = response.data.id;
                        this.selectedChapter.title = response.data.title;
                        this.selectedChapter.isLoading = false;

                        const lessonPlansFromApi =
                            response?.data?.lesson_plans ?? [];

                        this.selectedChapter.lessonPlan.forEach((lesson) => {
                            // Find the corresponding lesson_plan from API where phase_id matches lesson.id
                            const matchingLesson = lessonPlansFromApi.find(
                                (lp) => lp.phase_id === lesson.id
                            );

                            if (matchingLesson) {
                                lesson.content =
                                    matchingLesson.content_text || '';
                            }
                        });

                        // textbook
                        this.selectedChapter.textBook =
                            response?.data?.textbooks[0];

                        // reference materials
                        this.selectedChapter.referenceMaterials =
                            response?.data?.reference_materials;

                        this.chapterStatus = response?.data?.status;

                        this.generateBreadcrumb();
                    } else {
                        this._snackBar.showError(
                            `Error: Failed to fetch chapter details`
                        );
                    }
                },
                error: (error: any) => {
                    this.selectedChapter.isLoading = false;
                    this._snackBar.showError(
                        `Error: ${error?.message || 'Something went wrong.'}`
                    );
                },
            });
    }

    clonePhases(phases: any[]): any[] {
        return phases.map((phase) => ({ ...phase }));
    }

    onFileDrop(chapter: IChapters, event: DragEvent, type) {
        event.preventDefault();
        const files = Array.from(event.dataTransfer?.files || []);
        if (type === 2 && files.length > 0) {
            if (files.length > 10) {
                this._snackBar.showError(
                    this.translocoService.translate(
                        'chapters.max_limit_reached'
                    )
                );
            } else {
                this.uploadReferenceMaterialFiles(files, chapter);
            }
        }
    }

    onDragOver(chapter, event: DragEvent, type) {
        event.preventDefault();
    }

    onDragLeave(chapter, event: DragEvent, type) {
        event.preventDefault();
    }

    onFileSelected(chapter: IChapters, event: Event, type) {
        const input = event.target as HTMLInputElement;
        const files = Array.from(input.files || []);

        if (type === 2 && files.length > 0) {
            if (files.length > 10) {
                this._snackBar.showError(
                    this.translocoService.translate(
                        'chapters.max_limit_reached'
                    )
                );
            } else {
                this.uploadReferenceMaterialFiles(files, chapter);
            }
        }
    }

    uploadReferenceMaterialFiles(files: File[], chapter: IChapters) {
        this._chapterService
            .uploadReferenceMaterial(files, +chapter.id)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
                next: (res) => {
                    console.log('Upload success:', res);
                    if (res.success && res.status === 200) {
                        this.addFiles(
                            chapter,
                            files.length === 1 ? [res.file] : res.files,
                            2
                        );
                        this._snackBar.showSuccess(
                            this.translocoService.translate(
                                'chapters.rm_upload_success'
                            )
                        );
                    } else {
                        this._snackBar.showError(
                            this.translocoService.translate(
                                'chapters.rm_upload_error'
                            ) +
                                ' - ' +
                                res.message
                        );
                    }
                },
                error: (err) => {
                    console.error('Upload failed:', err);
                    this._snackBar.showError(
                        this.translocoService.translate(
                            'chapters.rm_upload_error'
                        )
                    );
                },
            });
    }

    addFiles(chapter: IChapters, files, type) {
        console.log('files', files);
        type === 1
            ? (chapter.textBook = Object.assign({}, ...files))
            : chapter.referenceMaterials.push(...files);
    }

    deleteReferenceMaterial(chapter: IChapters, file) {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: this.translocoService.translate(
                'chapters.deleteRMConfirmationTitle'
            ),
            message: this.translocoService.translate(
                'chapters.deletefileConfirmationMessage'
            ),
            actions: {
                confirm: {
                    label: this.translocoService.translate(
                        'common.deletePermanently'
                    ),
                },
            },
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {
            // If the confirm button pressed...
            if (result === 'confirmed') {
                this._chapterService
                    .deleteReferenceMaterial(file.id)
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe({
                        next: (res) => {
                            console.log('Delete success:', res);
                            chapter.referenceMaterials =
                                chapter.referenceMaterials.filter(
                                    (rmFile) =>
                                        Number(rmFile.id) !== Number(file.id)
                                );
                            this._snackBar.showSuccess(
                                this.translocoService.translate(
                                    'chapters.rm_delete_success'
                                )
                            );
                        },
                        error: (err) => {
                            console.error('Delete failed:', err);
                            this._snackBar.showError(
                                this.translocoService.translate(
                                    'chapters.rm_delete_error'
                                )
                            );
                        },
                    });
            }
        });
    }

    previewFile(file: any): void {
        const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            file.s3Url
        );
        this.matDialogRef = this._matDialog.open(this.filePreviewModal, {
            height: 'calc(100% - 30px)',
            width: 'calc(100% - 30px)',
            maxWidth: '100%',
            maxHeight: '100%',
            data: {
                name: file.filename,
                url: safeUrl,
                type: file.mimeType,
            },
        });
    }

    isImageFile(type: string): boolean {
        return type.startsWith('image/');
    }

    isPdfFile(type: string): boolean {
        return type === 'application/pdf';
    }

    isVideoFile(type: string): boolean {
        return type.startsWith('video/');
    }

    isAudioFile(type: string): boolean {
        return type.startsWith('audio/');
    }

    isSupportedFile(type: string): boolean {
        return (
            this.isImageFile(type) ||
            this.isPdfFile(type) ||
            this.isVideoFile(type) ||
            this.isAudioFile(type)
        );
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    onStatusChange(event) {
        console.log(event);
        const requestObj = {
            section_mapping_id: this.sectionMappingId,
            chapter_id: this.selectedChapter.id,
            status: event,
        };
        this._chapterService
            .updateChapterProgress(requestObj)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                (response: any) => {
                    if (response.status === 200 && response.success) {
                        this._snackBar.showSuccess(
                            this.translocoService.translate(
                                'chapters.progress_update_success'
                            )
                        );
                        this.chapterStatus = event;
                    }
                },
                (error) => {
                    console.error('Progress update failed:', error);
                    this._snackBar.showError(
                        this.translocoService.translate(
                            'chapters.progress_update_error'
                        )
                    );
                }
            );
    }
}
