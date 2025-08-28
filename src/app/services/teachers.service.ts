import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ITeachers } from 'app/models/teachers.types';
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

@Injectable({ providedIn: 'root' })
export class TeachersService {
    private _items: BehaviorSubject<ITeachers[] | null> = new BehaviorSubject(
        null
    );
    private _item: BehaviorSubject<ITeachers | null> = new BehaviorSubject(
        null
    );
    private apiUrl = '/api/insadmin/teacher';

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient) {}

    /**
     * Getter for single item
     */
    get item$(): Observable<ITeachers> {
        return this._item.asObservable();
    }

    /**
     * Getter for all items
     */
    get items$(): Observable<ITeachers[]> {
        return this._items.asObservable();
    }

    getAll() {
        return this._httpClient.get(this.apiUrl).pipe(
            tap((response: any) => {
                if (response?.status) {
                    this._items.next(response.data.rows as ITeachers[]);
                } else {
                    this._items.next([]);
                }
            })
        );
    }

    create(request): Observable<any> {
        return this.items$.pipe(
            take(1),
            switchMap((existingItems) =>
                this._httpClient
                    .post(this.apiUrl, {
                        ...request,
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
                                response.data[0] as ITeachers,
                                ...existingItems,
                            ]);

                            return of(response);
                        })
                    )
            )
        );
    }

    update(id, data): Observable<ITeachers> {
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
                    .put(this.apiUrl + '/' + id, { ...data })
                    .pipe(
                        map((response: any) => {
                            if (response?.status === 200) {
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
                return this._httpClient.delete(this.apiUrl + '/' + id).pipe(
                    map((isDeleted: boolean) => {
                        if (isDeleted) {
                            // Find the index of the deleted item
                            const index = items.findIndex(
                                (item) => item.id === id
                            );
                            // Delete the item
                            items.splice(index, 1);

                            // Update the items
                            this._items.next(items);
                        }
                        // Return the deleted status
                        return isDeleted;
                    })
                );
            })
        );
    }

    resendVerificationEmail(requestObj) {
        return this._httpClient.post(
            `${this.apiUrl}/resend-email-verification`,
            requestObj
        );
    }
}
