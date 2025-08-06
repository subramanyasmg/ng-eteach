import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
import { ISections } from 'app/models/sections.types';

@Injectable({ providedIn: 'root' })
export class SectionsService {
    private _items: BehaviorSubject<ISections[] | null> = new BehaviorSubject(
        null
    );
    private _item: BehaviorSubject<ISections | null> = new BehaviorSubject(null);
    private apiUrl = 'api/insadmin/';

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient
    ) {}

    /**
     * Getter for single item
     */
    get item$(): Observable<ISections> {
        return this._item.asObservable();
    }

    /**
     * Getter for all items
     */
    get items$(): Observable<ISections[]> {
        return this._items.asObservable();
    }

    getAll(gradeId: string) {
        return this._httpClient
            .get(`${this.apiUrl}section/${gradeId}`)
            .pipe(
                tap((response: any) => {
                    if (response?.status) {
                        this._items.next(response.data.rows as ISections[]);
                    } else {
                        this._items.next([]);
                    }
                })
            );
    }

    create(gradeId, request): Observable<any> {
        return this.items$.pipe(
            take(1),
            switchMap((existingItems) => {
                const items = existingItems ?? [];

                 return this._httpClient
                    .post(`${this.apiUrl}section`, {
                        ...request,
                        grade_id: gradeId,
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
                                response?.data as ISections,
                                ...items,
                            ]);

                            return of(response);
                        })
                    );
            })
        );
    }

    update(gradeId: string, data: ISections): Observable<any> {
        return this.items$.pipe(
            take(1),
            switchMap((existingItems) => {
                const items = existingItems ?? [];

                // Find the item to update
                const index = items.findIndex(
                    (item) => Number(item.id) === Number(data.id)
                );

                if (index === -1) {
                    // Simulate failure if item not found
                    return throwError(() => new Error('Item not found'));
                }

                // Simulate API delay and response
                return this._httpClient
                    .put(`${this.apiUrl}updateSection`, {
                        name: data.section_name,
                        grade_id: data.grade_id,
                        id: Number(data.id),
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
                    .delete(`${this.apiUrl}deleteSection/${id}`)
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
}
