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
import { ICurriculum } from '../curriculum.types';

@Injectable({ providedIn: 'root' })
export class CurriculumService {
    private _items: BehaviorSubject<ICurriculum[] | null> = new BehaviorSubject(
        null
    );
    private _item: BehaviorSubject<ICurriculum | null> = new BehaviorSubject(
        null
    );
    private apiUrl = '/api/a/curriculum';

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

    getAll() {

        return this._httpClient
            .get(this.apiUrl)
            .pipe(
                tap((response: any) => {
                    if (response?.status) {
                        this._items.next(response.data as ICurriculum[]);
                    } else {
                         this._items.next([]);
                    }
                })
            );
    }

    // getAll() {
    //     // Mock data
    //     const mockData: ICurriculum[] = [
    //         {
    //             id: '1',
    //             name: 'CBSE',
    //             createdOn: '19 Mar, 2025',
    //             publisherName: 'Manju KV',
    //             publisherEmail: 'kvmanju@gmail.com',
    //             phone: '+91 98455 20945',
    //         },
    //         {
    //             id: '2',
    //             name: 'ICSC',
    //             createdOn: '12 Mar, 2025',
    //             publisherName: 'Kishan G',
    //             publisherEmail: 'kishang@gmail.com',
    //             phone: '+91 98455 20945',
    //         },
    //     ];

    //     // Simulate API delay and emit mock data
    //     return of({ status: true, data: mockData }).pipe(
    //         delay(500), // optional: to simulate network delay
    //         tap((response: any) => {
    //             console.log('Mock response:', response);
    //             if (response.status) {
    //                 this._items.next(response.data as ICurriculum[]);
    //             } else {
    //                 this._items.next([]);
    //             }
    //         })
    //     );
    // }

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
    //                         response.data as ICurriculum,
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
                    data:
                        {
                            id: Date.now().toString(),
                            name: request.name,
                            createdOn: new Date().toLocaleDateString(),
                            publisherName: request.publisherName,
                            publisherEmail: request.publisherEmail,
                            phone: request.phone,
                        }
                };

                return of(mockResponse).pipe(
                    delay(300), // Simulate API delay
                    mergeMap((response: any) => {
                        if (!response.status) {
                            return throwError(() => new Error('Something went wrong while adding'));
                        }

                        this._items.next([
                            response.data as ICurriculum,
                            ...items,
                        ]);

                        return of(response);
                    })
                );
            })
        );
    }

    update(id, data): Observable<ICurriculum> {
        return this.items$.pipe(
            take(1),
            switchMap((item) =>
                this._httpClient.put(this.apiUrl + '/' + id, { ...data }).pipe(
                    map((response: any) => {
                        if (response.status) {
                            // Find the index of the updated item
                            const index = item.findIndex(
                                (item) => item.id === id
                            );

                            // Update the item
                            item[index] = response.data[0];

                            // Update the items
                            this._items.next(item);
                        }
                        return response;
                    })
                )
            )
        );
    }

    delete(id: string): Observable<boolean> {
        return this.items$.pipe(
            take(1),
            switchMap((item) =>
                this._httpClient.delete(this.apiUrl + '/' + id).pipe(
                    map((isDeleted: boolean) => {
                        if (isDeleted) {
                            // Find the index of the deleted item
                            const index = item.findIndex(
                                (item) => item.id === id
                            );
                            // Delete the item
                            item.splice(index, 1);

                            // Update the items
                            this._items.next(item);
                        }
                        // Return the deleted status
                        return isDeleted;
                    })
                )
            )
        );
    }
}
