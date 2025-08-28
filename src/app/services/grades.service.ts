import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { USER_TYPES } from 'app/constants/usertypes';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
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
import { IGrades } from '../models/grades.types';
import { SecureSessionStorageService } from './securestorage.service';

@Injectable({ providedIn: 'root' })
export class GradesService {
    private _items: BehaviorSubject<IGrades[] | null> = new BehaviorSubject(
        null
    );
    private _item: BehaviorSubject<IGrades | null> = new BehaviorSubject(null);
    private apiUrl = 'api/superadmin/';

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService,
        private _secureStorageService: SecureSessionStorageService
    ) {}

    /**
     * Getter for single item
     */
    get item$(): Observable<IGrades> {
        return this._item.asObservable();
    }

    /**
     * Getter for all items
     */
    get items$(): Observable<IGrades[]> {
        return this._items.asObservable();
    }

    getAll(curriculumId: string) {
        let user = this._secureStorageService.getItem<User>('user');
        switch (user.type) {
            case USER_TYPES.INSTITUTE_ADMIN:
                this.apiUrl = 'api/insadmin/grade';
                break;
            case USER_TYPES.SUPER_ADMIN:
            case USER_TYPES.PUBLISHER_ADMIN:
            case USER_TYPES.PUBLISHER_USER:
                this.apiUrl = `api/superadmin/grade/${curriculumId}`;
                break;
            default:
                throw new Error('Unsupported user type');
        }

        return this._httpClient.get(this.apiUrl).pipe(
            tap((response: any) => {
                if (response?.status) {
                    this._items.next(response.data.rows as IGrades[]);
                } else {
                    this._items.next([]);
                }
            })
        );
    }

    create(curriculumId, request): Observable<any> {
        return this.items$.pipe(
            take(1),
            switchMap((item) =>
                this._httpClient
                    .post('api/superadmin/grade', {
                        ...request,
                        curriculum_id: curriculumId,
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
                                response?.data as IGrades,
                                ...item,
                            ]);

                            return of(response);
                        })
                    )
            )
        );
    }

    update(curriculumId: string, data: IGrades): Observable<any> {
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
                    .put(`api/superadmin/grade`, {
                        name: data.grade_name,
                        curriculum_id: curriculumId,
                        id: Number(data.id),
                    })
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

    delete(id: string): Observable<boolean> {
        return this.items$.pipe(
            take(1),
            switchMap((existingItems) => {
                const items = [...(existingItems ?? [])];

                // Find the index of the item to delete
                const index = items.findIndex((item) => item.id === id);

                return this._httpClient
                    .delete(`api/superadmin/grade/${id}`)
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
