import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay, of, tap, throwError } from 'rxjs';
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
        // return this._httpClient
        //     .get(`api/teacher/teacher-dashboard`)
        return of({
            success: true,
            status: 200,
            data: [
                {
                    grade_name: 'Grade 1',
                    section_name: 'Section A',
                    subject_name: 'Math',
                    completed: 10,
                    total: 50
                },
                {
                    grade_name: 'Grade 2',
                    section_name: 'Section B',
                    subject_name: 'Science',
                    completed: 25,
                    total: 40
                },
                {
                    grade_name: 'Grade 3',
                    section_name: 'Section C',
                    subject_name: 'English',
                    completed: 35,
                    total: 50
                },
                {
                    grade_name: 'Grade 4',
                    section_name: 'Section D',
                    subject_name: 'History',
                    completed: 15,
                    total: 30
                },
            ],
        }).pipe(
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
