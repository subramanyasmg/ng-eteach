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
import { ITeachers } from 'app/models/teachers.types';

@Injectable({ providedIn: 'root' })
export class TeachersService {
    private _items: BehaviorSubject<ITeachers[] | null> = new BehaviorSubject(
        null
    );
    private _item: BehaviorSubject<ITeachers | null> = new BehaviorSubject(
        null
    );
    private apiUrl = '/api/a/teachers';

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
                    this._items.next(response.data as ITeachers[]);
                } else {
                    this._items.next([]);
                }
            })
        );
    }

    // create(request): Observable<any> {
    //     return this.items$.pipe(
    //         take(1),
    //         switchMap((item) =>
    //             this._httpClient.post(this.apiUrl, { ...request }).pipe(
    //                 mergeMap((response: any) => {
    //                     if (!response.status) {
    //                         return throwError(() => new Error('Something went wrong while adding'));
    //                     }

    //                     this._items.next([
    //                         response.data as ITeachers,
    //                         ...item,
    //                     ]);

    //                     return of(response);
    //                 })
    //             )
    //         )
    //     );
    // }

    create(request): Observable<any> {
        return this.items$.pipe(
            take(1),
            switchMap((existingItems) => {
                const items = existingItems ?? [];

                const mockResponse = {
                    status: true,
                    data: {
                        id: Date.now().toString(),
                        name: request.name,
                        email: request.email,
                        phone: request.phone,
                        subjectExpertise: request.subjectExpertise,
                        associatedClass: request.associatedClass
                    } as ITeachers,
                };

                return of(mockResponse).pipe(
                    delay(300), // Simulate API delay
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
                            response.data as ITeachers,
                            ...items,
                        ]);

                        return of(response);
                    })
                );
            })
        );
    }

    // update(id, data): Observable<ITeachers> {
    //     return this.items$.pipe(
    //         take(1),
    //         switchMap((item) =>
    //             this._httpClient.put(this.apiUrl + '/' + id, { ...data }).pipe(
    //                 map((response: any) => {
    //                     if (response.status) {
    //                         // Find the index of the updated item
    //                         const index = item.findIndex(
    //                             (item) => item.id === id
    //                         );

    //                         // Update the item
    //                         item[index] = response.data[0];

    //                         // Update the items
    //                         this._items.next(item);
    //                     }
    //                     return response;
    //                 })
    //             )
    //         )
    //     );
    // }

    update(id: string, updatedData: ITeachers): Observable<any> {
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

                // Create updated item
                const updatedItem: ITeachers = {
                    ...items[index],
                    ...updatedData,
                };

                // Simulate API delay and response
                return of({
                    status: true,
                    data: updatedItem,
                }).pipe(
                    delay(300),
                    map((response) => {
                        if (response.status) {
                            // Replace the old item with updated item
                            const updatedList = [...items];
                            updatedList[index] = updatedItem;

                            // Emit new state
                            this._items.next(updatedList);

                            return response;
                        } else {
                            return throwError(() => new Error('Update failed'));
                        }
                    })
                );
            })
        );
    }

    // delete(id: string): Observable<boolean> {
    //     return this.items$.pipe(
    //         take(1),
    //         switchMap((existingItems) => {
    //             const items = existingItems ?? [];
    //             return this._httpClient.delete(this.apiUrl + '/' + id).pipe(
    //                 map((isDeleted: boolean) => {
    //                     if (isDeleted) {
    //                         // Find the index of the deleted item
    //                         const index = items.findIndex(
    //                             (item) => item.id === id
    //                         );
    //                         // Delete the item
    //                         items.splice(index, 1);

    //                         // Update the items
    //                         this._items.next(items);
    //                     }
    //                     // Return the deleted status
    //                     return isDeleted;
    //                 })
    //             );
    //         })
    //     );
    // }

    delete(id: string): Observable<boolean> {
        return this.items$.pipe(
            take(1),
            switchMap((existingItems) => {
                const safeItems = existingItems ?? [];

                // Find the index of the item to delete
                const index = safeItems.findIndex((item) => item.id === id);

                // Simulate API delay and deletion
                return of(true).pipe(
                    delay(300),
                    map((isDeleted) => {
                        if (isDeleted && index !== -1) {
                            // Remove item from the list
                            safeItems.splice(index, 1);

                            // Update the observable stream
                            this._items.next([...safeItems]);
                        }
                        return isDeleted;
                    })
                );
            })
        );
    }
}
