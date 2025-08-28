import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { USER_TYPES } from 'app/constants/usertypes';
import { User } from 'app/core/user/user.types';
import {
    BehaviorSubject,
    Observable,
    delay,
    map,
    mergeMap,
    of,
    switchMap,
    take,
    tap,
    throwError,
} from 'rxjs';
import { IChapters } from '../models/chapters.types';
import { SecureSessionStorageService } from './securestorage.service';

@Injectable({ providedIn: 'root' })
export class ChaptersService {
    private _items: BehaviorSubject<IChapters[] | null> = new BehaviorSubject(
        null
    );
    private _phases: BehaviorSubject<any[] | null> = new BehaviorSubject(null);
    private _item: BehaviorSubject<IChapters | null> = new BehaviorSubject(
        null
    );
    private apiUrl = 'api/superadmin/';

    constructor(
        private _httpClient: HttpClient,
        private _secureStorageService: SecureSessionStorageService
    ) {}

    get item$(): Observable<IChapters> {
        return this._item.asObservable();
    }

    get items$(): Observable<IChapters[]> {
        return this._items.asObservable();
    }

    get phases$(): Observable<IChapters[]> {
        return this._phases.asObservable();
    }

    getAll(subjectId: string) {
        let user = this._secureStorageService.getItem<User>('user');
        switch (user?.type) {
            case USER_TYPES.INSTITUTE_ADMIN:
            case USER_TYPES.TEACHER:
                this.apiUrl = 'api/insadmin/';
                break;
            case USER_TYPES.SUPER_ADMIN:
            case USER_TYPES.PUBLISHER_ADMIN:
            case USER_TYPES.PUBLISHER_USER:
                this.apiUrl = 'api/superadmin/';
                break;
            default:
                throw new Error('Unsupported user type');
        }

        return this._httpClient.get(`${this.apiUrl}chapter/${subjectId}`).pipe(
            tap((response: any) => {
                if (response?.status) {
                    this._items.next(response.data.rows as IChapters[]);
                } else {
                    this._items.next([]);
                }
            })
        );
    }

    getChapterDetails(subjectId, chapterId) {
        let user = this._secureStorageService.getItem<User>('user');
        switch (user?.type) {
            case USER_TYPES.INSTITUTE_ADMIN:
            case USER_TYPES.TEACHER:
                this.apiUrl = 'api/insadmin/';
                break;
            case USER_TYPES.SUPER_ADMIN:
            case USER_TYPES.PUBLISHER_ADMIN:
            case USER_TYPES.PUBLISHER_USER:
                this.apiUrl = 'api/superadmin/';
                break;
            default:
                throw new Error('Unsupported user type');
        }
        return this._httpClient.get(`${this.apiUrl}get-chapter/${chapterId}`);
    }

    createLessonPlan(request) {
        return this._httpClient.post<boolean>(`${this.apiUrl}lesson-plan`, {
            ...request,
        });
    }

    getPhases() {
        let user = this._secureStorageService.getItem<User>('user');
        switch (user?.type) {
            case USER_TYPES.INSTITUTE_ADMIN:
            case USER_TYPES.TEACHER:
                this.apiUrl = 'api/insadmin/';
                break;
            case USER_TYPES.SUPER_ADMIN:
            case USER_TYPES.PUBLISHER_ADMIN:
            case USER_TYPES.PUBLISHER_USER:
                this.apiUrl = 'api/superadmin/';
                break;
            default:
                throw new Error('Unsupported user type');
        }

        return this._httpClient.get(`${this.apiUrl}five-phases`).pipe(
            tap((response: any) => {
                if (response.status) {
                    this._phases.next(response.data);
                }
            })
        );
    }

    create(subjectId: string, request: IChapters): Observable<any> {
        return this.items$.pipe(
            take(1),
            switchMap((item) =>
                this._httpClient
                    .post(`${this.apiUrl}chapter`, {
                        subject_id: subjectId,
                        title: request.title,
                    })
                    .pipe(
                        mergeMap((response: any) => {
                            if (response.status !== 200) {
                                return throwError(
                                    () =>
                                        new Error(
                                            response.message ??
                                                'Something went wrong while adding'
                                        )
                                );
                            }

                            this._items.next([
                                response.data as IChapters,
                                ...item,
                            ]);

                            return of(response);
                        })
                    )
            )
        );
    }

    update(id: string, data: IChapters): Observable<any> {
        return this.items$.pipe(
            take(1),
            switchMap((existingItems) => {
                const items = existingItems ?? [];

                // Find the item to update
                const index = items.findIndex((item) => item.id === id);

                if (index === -1) {
                    // Simulate failure if item not found
                    return throwError(() => new Error('Item not found'));
                }

                // Simulate API delay and response
                return this._httpClient
                    .put(`${this.apiUrl}updateChapter`, {
                        ...data,
                        subject_id: id,
                    })
                    .pipe(
                        delay(300),
                        map((response: any) => {
                            if (response.status === 200) {
                                // Replace the old item with updated item
                                const updatedList = [...items];
                                updatedList[index] = response?.data;

                                // Emit new state
                                this._items.next(updatedList);

                                return response;
                            } else {
                                return throwError(
                                    () => new Error('Update failed')
                                );
                            }
                        })
                    );
            })
        );
    }

    delete(id: string): Observable<boolean> {
        return this.items$.pipe(
            take(1),
            switchMap((existingItems) => {
                const items = [...(existingItems ?? [])];

                // Find the index of the item to delete
                const index = items.findIndex((item) => item.id === id);

                return this._httpClient
                    .delete(`${this.apiUrl}deleteChapter/${id}`)
                    .pipe(
                        map((response: any) => {
                            if (response?.status === 200 && index !== -1) {
                                // Remove item from the list
                                items.splice(index, 1);

                                // Update the observable stream
                                this._items.next([...items]);
                                return true;
                            }
                            return false;
                        })
                    );
            })
        );
    }

    uploadTextbook(file: File, chapterId: number): Observable<any> {
        let user = this._secureStorageService.getItem<User>('user');
        switch (user?.type) {
            case USER_TYPES.INSTITUTE_ADMIN:
            case USER_TYPES.TEACHER:
                this.apiUrl = 'api/insadmin/';
                break;
            case USER_TYPES.SUPER_ADMIN:
            case USER_TYPES.PUBLISHER_ADMIN:
            case USER_TYPES.PUBLISHER_USER:
                this.apiUrl = 'api/superadmin/';
                break;
            default:
                throw new Error('Unsupported user type');
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('chapter_id', chapterId.toString());

        return this._httpClient.post(`${this.apiUrl}textbook`, formData);
    }

    uploadReferenceMaterial(files: File[], chapterId: number): Observable<any> {
        let user = this._secureStorageService.getItem<User>('user');
        switch (user?.type) {
            case USER_TYPES.INSTITUTE_ADMIN:
            case USER_TYPES.TEACHER:
                this.apiUrl = 'api/insadmin/';
                break;
            case USER_TYPES.SUPER_ADMIN:
            case USER_TYPES.PUBLISHER_ADMIN:
            case USER_TYPES.PUBLISHER_USER:
                this.apiUrl = 'api/superadmin/';
                break;
            default:
                throw new Error('Unsupported user type');
        }

        const formData = new FormData();
        if (files.length > 1) {
            for (const file of files) {
                formData.append('files', file); // same key for multiple files
            }
        } else {
            formData.append('file', files[0]);
        }
        formData.append('chapter_id', chapterId.toString());

        if (files.length > 1) {
            return this._httpClient.post(
                `${this.apiUrl}referenceMaterials/upload-multiple`,
                formData
            );
        } else {
            return this._httpClient.post(
                `${this.apiUrl}referenceMaterials`,
                formData
            );
        }
    }

    deleteTextbook(id) {
        return this._httpClient.delete(`${this.apiUrl}textbook/${id}`);
    }

    deleteReferenceMaterial(id) {
        return this._httpClient.delete(
            `${this.apiUrl}referenceMaterials/${id}`
        );
    }

    updateChapterProgress(requestObj) {
        return this._httpClient.put(
            `${this.apiUrl}syllabus-progress`,
            requestObj
        );
    }
}
