import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, tap, throwError } from 'rxjs';
import { SecureSessionStorageService } from './securestorage.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
    constructor(
        private _httpClient: HttpClient,
        private _secureStorageService: SecureSessionStorageService
    ) {}

    getSuperAdminDashboard() {
        return this._httpClient.get(`api/superadmin/admin-dashboard`).pipe(
            tap((response: any) => {
                if (response?.success) {
                    return response;
                } else {
                    return throwError(
                        () =>
                            new Error(
                                'Failed to get super admin dashboard information'
                            )
                    );
                }
            })
        );
    }

    getInstituteAdminDashboard() {
        return this._httpClient.get(`api/insadmin/admin-dashboard`).pipe(
            tap((response: any) => {
                if (response?.success) {
                    return response;
                } else {
                    return throwError(
                        () => new Error('Failed to get dashboard information')
                    );
                }
            })
        );
    }

    getTeacherDashboard() {
        return this._httpClient.get(`api/insadmin/teacher-dashboard`).pipe(
            delay(300),
            tap((response: any) => {
                if (response?.success) {
                    return response;
                } else {
                    return throwError(
                        () => new Error('Failed to get dashboard information')
                    );
                }
            })
        );
    }
}
