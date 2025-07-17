import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    BehaviorSubject,
    Observable,
    catchError,
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

@Injectable({ providedIn: 'root' })
export class ChaptersService {
    private _items: BehaviorSubject<IChapters[] | null> = new BehaviorSubject(
        null
    );
    private _phases: BehaviorSubject<any[] | null> =
        new BehaviorSubject(null);
    private _item: BehaviorSubject<IChapters | null> = new BehaviorSubject(
        null
    );
    private apiUrl = 'api/superadmin/';

    constructor(private _httpClient: HttpClient) {}


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
        return this._httpClient
            .get(`${this.apiUrl}getAllChapters/${subjectId}`)
            .pipe(
                tap((response: any) => {
                    if (response?.status) {
                        this._items.next(response.data as IChapters[]);
                    } else {
                        this._items.next([]);
                    }
                })
            );
    }

    // getPhases() {
    //     return this._httpClient.get(`${this.apiUrl}getPhases`).pipe(
    //         map((response: any) => {
    //             if (response?.status) {
    //                 this._items.next(response.data);
    //             } else {
    //                 throw new Error(
    //                     'Something went wrong while fetching phases'
    //                 );
    //             }
    //         }),
    //         catchError((error) => {
    //             console.error('Error fetching phases:', error);
    //             return throwError(
    //                 () => new Error(error.message || 'Unknown error')
    //             );
    //         })
    //     );
    // }

    getPhases() {
        return this._httpClient
            .get(`${this.apiUrl}getPhases`)
            .pipe(
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
                    .post(`${this.apiUrl}createChapter`, {
                        subject_id: subjectId,
                        title: request.title,
                    })
                    .pipe(
                        mergeMap((response: any) => {
                            if (!response.status) {
                                return throwError(
                                    () =>
                                        new Error(
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
                    .put(`${this.apiUrl}updateChapter/${id}`, { ...data })
                    .pipe(
                        delay(300),
                        map((response: any) => {
                            if (response.status) {
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
                            if (response?.status && index !== -1) {
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
}
