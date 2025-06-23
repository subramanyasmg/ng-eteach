
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    BehaviorSubject,
    Observable,
    filter,
    map,
    of,
    switchMap,
    take,
    tap,
    throwError,
} from 'rxjs';
import { ICurriculum } from '../curriculum.types';

@Injectable({ providedIn: 'root' })

export class CurriculumService {

    private _items: BehaviorSubject<ICurriculum[] | null> =
        new BehaviorSubject(null);
    private _item: BehaviorSubject<ICurriculum | null> =
        new BehaviorSubject(null);
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

        return this._items.next([
            {
                id: 1,
                name:'CBSE',
                createdOn: '19 Mar, 2025',
                publisherName: 'Manju KV',
                publisherEmail: 'kvmanju@gmail.com',
                phone: '+91 98455 20945'
            }
        ] as ICurriculum[]);

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

    create(request): Observable<any> {
        return this.items$.pipe(
            take(1),
            switchMap((item) =>
                this._httpClient
                    .post(
                        this.apiUrl,
                        { ...request}
                    )
                    .pipe(
                        map((response: any) => {
                            if (response.status) {
                                this._items.next([response.data[0] as ICurriculum, ...item]);
                            }
                            return response;
                        })
                    )
            )
        );
    }

    update(id, data): Observable<ICurriculum> {
        return this.items$.pipe(
            take(1),
            switchMap((item) =>
                this._httpClient
                    .put(
                        this.apiUrl + '/'+id,
                        {...data}
                    )
                    .pipe(
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


    delete(id: number): Observable<boolean> {
        return this.items$.pipe(
            take(1),
            switchMap((item) =>
                this._httpClient
                    .delete(this.apiUrl + '/' + id)
                    .pipe(
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
