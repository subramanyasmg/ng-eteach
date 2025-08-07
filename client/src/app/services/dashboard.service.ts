import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { USER_TYPES } from 'app/constants/usertypes';
import { User } from 'app/core/user/user.types';
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
import { IChapters } from '../models/chapters.types';
import { SecureSessionStorageService } from './securestorage.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {

    constructor(
        private _httpClient: HttpClient,
        private _secureStorageService: SecureSessionStorageService
    ) {}


    getSuperAdminDashboard() {
        return this._httpClient
            .get(`api/superadmin/admin-dashboard`)
            .pipe(
                tap((response: any) => {
                    if (response?.success) {
                        return response;
                    } else {
                        return throwError(
                            () => new Error('Failed to get super admin dashboard')
                        );
                    }
                })
            );
    }

}
