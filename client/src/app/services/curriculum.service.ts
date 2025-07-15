import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    BehaviorSubject,
    Observable,
    map,
    mergeMap,
    of,
    switchMap,
    take,
    tap,
    throwError,
} from 'rxjs';
import { ICurriculum } from '../models/curriculum.types';

@Injectable({ providedIn: 'root' })
export class CurriculumService {
    private _items: BehaviorSubject<ICurriculum[] | null> = new BehaviorSubject(
        null
    );
    private _item: BehaviorSubject<ICurriculum | null> = new BehaviorSubject(
        null
    );
    private apiUrl = 'api/superadmin/';

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    /**
     * Getter for single item
     */
    get item$(): Observable<ICurriculum> {
        return this._item.asObservable();
    }

    /**
     * Getter for all items
     */
    get items$(): Observable<ICurriculum[]> {
        return this._items.asObservable();
    }

    getAll(publisherId: string) {
        return this._httpClient.get(`${this.apiUrl}getAllCurriculums/${publisherId}`).pipe(
            tap((response: any) => {
                if (response?.status) {
                    this._items.next(response.data as ICurriculum[]);
                } else {
                    this._items.next([]);
                }
            })
        );
    }

    create(publisherId, request): Observable<any> {
        return this.items$.pipe(
            take(1),
            switchMap((item) =>
                this._httpClient
                    .post(`${this.apiUrl}createCurriculum`, { ...request, publisher_id: publisherId })
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
                                response?.data as ICurriculum,
                                ...item,
                            ]);

                            return of(response);
                        })
                    )
            )
        );
    }

    update(id: number, data: ICurriculum): Observable<ICurriculum> {
        return this.items$.pipe(
            take(1),
            switchMap((existingItems) => {
                const items = [...(existingItems ?? [])];

                // Find the item to update
                const index = items.findIndex((item) => item.id === id);

                if (index === -1) {
                    // Simulate failure if item not found
                    return throwError(() => new Error('Item not found'));
                }

                return this._httpClient
                    .put(`${this.apiUrl}updateCurriculum/${id}`, { curriculum_name: data.curriculum_name, publisher_id: data.publisher_id })
                    .pipe(
                        map((response: any) => {
                            if (response?.status) {
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

    delete(id: number): Observable<boolean> {
        return this.items$.pipe(
            take(1),
            switchMap((existingItems) => {
                const items = existingItems ?? [];

                // Find the index of the item to delete
                const index = items.findIndex((item) => item.id === id);

                return this._httpClient
                    .delete(`${this.apiUrl}deleteCurriculum/${id}`)
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
