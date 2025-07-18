import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPublisher } from 'app/models/publisher.types';
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
export class PublisherService {
    private _items: BehaviorSubject<IPublisher[] | null> = new BehaviorSubject(
        null
    );
    private _item: BehaviorSubject<IPublisher | null> = new BehaviorSubject(
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
    get item$(): Observable<IPublisher> {
        return this._item.asObservable();
    }

    /**
     * Getter for all items
     */
    get items$(): Observable<IPublisher[]> {
        return this._items.asObservable();
    }

    getAll() {
        return this._httpClient.get(`${this.apiUrl}getAllPublishers`).pipe(
            tap((response: any) => {
                if (response?.status) {
                    this._items.next(response.publishers as IPublisher[]);
                } else {
                    this._items.next([]);
                }
            })
        );
    }

    create(request): Observable<any> {
        return this.items$.pipe(
            take(1),
            switchMap((item) =>
                this._httpClient
                    .post(`${this.apiUrl}createPublisher`, { ...request})
                    .pipe(
                        mergeMap((response: any) => {
                            if (response.status !== 200) {
                                return throwError(
                                    () =>
                                        new Error(
                                           response.message ?? 'Something went wrong while adding'
                                        )
                                );
                            }

                            this._items.next([
                                response?.publisher as IPublisher,
                                ...item,
                            ]);

                            return of(response);
                        })
                    )
            )
        );
    }

    update(id: number, data: IPublisher): Observable<IPublisher> {
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
                    .put(`${this.apiUrl}updatePublisher/${id}`, { ...data })
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

    delete(id: number): Observable<boolean> {
        return this.items$.pipe(
            take(1),
            switchMap((existingItems) => {
                const items = existingItems ?? [];

                // Find the index of the item to delete
                const index = items.findIndex((item) => item.id === id);

                return this._httpClient
                    .delete(`${this.apiUrl}deletePublisher/${id}`)
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
