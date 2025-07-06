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

    getAll() {
        return this._httpClient.get(`${this.apiUrl}getAllPublishers`).pipe(
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
                this._httpClient.post(`${this.apiUrl}createPublisher`, { ...request }).pipe(
                    mergeMap((response: any) => {
                        if (!response.status) {
                            return throwError(() => new Error('Something went wrong while adding'));
                        }

                        this._items.next([
                            response.data as ICurriculum,
                            ...item,
                        ]);

                        return of(response);
                    })
                )
            )
        );
    }


     update(id: string, data: ICurriculum): Observable<ICurriculum> {
        return this.items$.pipe(
            take(1),
            switchMap((item) =>
                this._httpClient.put(`${this.apiUrl}updatePublisher/${id}`, { ...data }).pipe(
                    map((response: any) => {
                        if (response.status) {
                            // Find the index of the updated item
                            const index = item.findIndex(
                                (item) => item.id === id
                            );

                            // Update the item
                            item[index] = response.data;

                            // Update the items
                            this._items.next(item);
                        }
                        return response.data as ICurriculum;
                    })
                )
            )
        );
    }

    // update(id: string, updatedData: ICurriculum): Observable<any> {
    //     console.log(id, updatedData);   

    //     return this._httpClient.put(`${this.apiUrl}updatePublisher/${id}`, updatedData).pipe(
    //         map((response: any) => {
    //             if (response.status) {
    //                 return response.data;
    //             }
    //             return throwError(() => new Error('Update failed'));
    //         })
    //     );
        
    // }

    delete(id: string): Observable<boolean> {
        return this._httpClient.delete(`${this.apiUrl}deletePublisher/${id}`).pipe(
            map((response: any) => {
                if (response.status) {
                    return true;
                }
                return false;
            })
        );
    }
}
