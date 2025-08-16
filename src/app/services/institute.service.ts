import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
    BehaviorSubject,
    Observable,
    catchError,
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
        return this._httpClient.get(`${this.apiUrl}organization`).pipe(
            tap((response: any) => {
                if (response?.status) {
                    this._items.next(response.data as IInstitutes[]);
                } else {
                    this._items.next([]);
                }
            })
        );
    }

    checkSubdomainAvailability(subdomain: string): Observable<boolean> {
        return this._httpClient
            .get<boolean>(`${this.apiUrl}check-subdomain/${subdomain}`)
            .pipe(
                map((response: any) => response.status), // Success => subdomain is available
                catchError((err) => {
                    if (err.status === 400 || err.status === 500) {
                        return of(false);
                    }
                    return throwError(() => err); // rethrow other errors
                })
            );
    }

    create(request: IInstitutes): Observable<any> {
        return this.items$.pipe(
            take(1),
            switchMap((existingItems) => {
                const items = existingItems ?? [];

                return this._httpClient
                    .post(`${this.apiUrl}organization`, {
                        institute_name: request.institute_name,
                        admin_name: request.admin_name,
                        email: request.email,
                        phone: request.phone,
                        address: request.address,
                        publisher_id: request.publisher_id,
                        curriculum_id: request.curriculum_id,
                        subdomain: request.subdomain,
                        total_licenses: request.total_licenses,
                        license_end: request.license_end,
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
                                response.data as IInstitutes,
                                ...items,
                            ]);

                            return of(response);
                        })
                    );
            })
        );
    }

    update(id: number, data: IInstitutes): Observable<any> {
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
                    .put(`${this.apiUrl}organization/${id}`, { ...data })
                    .pipe(
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

    delete(id: number): Observable<boolean> {
        return this.items$.pipe(
            take(1),
            switchMap((existingItems) => {
                const items = [...(existingItems ?? [])];

                // Find the index of the item to delete
                const index = items.findIndex((item) => item.id === id);

                return this._httpClient
                    .delete(`${this.apiUrl}organization/${id}`)
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

    resendVerificationEmail(requestObj) {
        return this._httpClient.post(`${this.apiUrl}organization/resend-email-verification`, requestObj);
    }
}
