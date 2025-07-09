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
import { IInstitutes } from '../models/institutes.types';

@Injectable({ providedIn: 'root' })
export class InstituteService {
    private _items: BehaviorSubject<IInstitutes[] | null> = new BehaviorSubject(
        null
    );
    private _item: BehaviorSubject<IInstitutes | null> = new BehaviorSubject(
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
    get item$(): Observable<IInstitutes> {
        return this._item.asObservable();
    }

    /**
     * Getter for all items
     */
    get items$(): Observable<IInstitutes[]> {
        return this._items.asObservable();
    }

    getAll() {
        return this._httpClient.get(`${this.apiUrl}getAllInstitutes`).pipe(
            tap((response: any) => {
                if (response?.status) {
                    this._items.next(response.data as IInstitutes[]);
                } else {
                    this._items.next([]);
                }
            })
        );
    }

    create(request): Observable<any> {
        return this.items$.pipe(
            take(1),
            switchMap((existingItems) => {
                const items = existingItems ?? [];

                return this._httpClient
                    .post(`${this.apiUrl}createInstitute`, {
                        ...request,
                    })
                    .pipe(
                        delay(300), // Simulate API delay
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
                                response.data as IInstitutes,
                                ...items,
                            ]);

                            return of(response);
                        })
                    );
            })
        );
    }

    update(id: string, data: IInstitutes): Observable<any> {
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

                return this._httpClient
                    .put(`${this.apiUrl}updateInstitute/${id}`, { ...data })
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
                const items = existingItems ?? [];

                // Find the index of the item to delete
                const index = items.findIndex((item) => item.id === id);

                return this._httpClient
                    .delete(`${this.apiUrl}deleteInstitute/${id}`)
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
