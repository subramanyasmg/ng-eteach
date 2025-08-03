import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { USER_TYPES } from 'app/constants/usertypes';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { SecureSessionStorageService } from 'app/services/securestorage.service';
import * as CryptoJS from 'crypto-js';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { User } from '../user/user.types';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);
    private _secureStorageService = inject(SecureSessionStorageService);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        this._secureStorageService.setItem('accessToken', token);
    }

    get accessToken(): string {
        return this._secureStorageService.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }, type): Observable<any> {

        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        // credentials.password = CryptoJS.MD5(credentials.password).toString(
        //     CryptoJS.enc.Hex
        // );

        let url = '';

        if (type === USER_TYPES.SUPER_ADMIN) {
            url = '/api/superadmin/publishers/login';
        } else if (type === USER_TYPES.INSTITUTE_ADMIN) {
            url = '/api/insadmin/login';
        }

        return this._httpClient.post(url, credentials).pipe(
            switchMap((response: any) => {
                if (response.success && response.status === 200) { 
                    // Store the access token in the local storage
                    this.accessToken = response.data.token;
    
                    // Set the authenticated flag to true
                    this._authenticated = true;
    
                    // Store the user on the user service
                    let user = {};
                    if (type === USER_TYPES.INSTITUTE_ADMIN) {
                        user = {
                            id: response.data.user.id,
                            name:   response.data.user.firstName,
                            email: response.data.user.email,
                            type: response.data.user.role,
                        };
                    } else if (type === USER_TYPES.SUPER_ADMIN) {
                        user = {
                            id: response.data.publisher.id,
                            name:   response.data.publisher.name,
                            email: response.data.publisher.email,
                            type: response.data.publisher.role,
                        };
                    }
                    this._userService.user = user as User;
                    
    
                     this._secureStorageService.setItem(
                                'user', user);
    
                    // Return a new observable with the response
                    return of(user);
                }
            })
        );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any> {
        // Sign in using the token
        return this._httpClient
            .post('api/auth/sign-in-with-token', {
                accessToken: this.accessToken,
            })
            .pipe(
                catchError(() =>
                    // Return false
                    of(false)
                ),
                switchMap((response: any) => {
                    // Replace the access token with the new one if it's available on
                    // the response object.
                    //
                    // This is an added optional step for better security. Once you sign
                    // in using the token, you should generate a new one on the server
                    // side and attach it to the response object. Then the following
                    // piece of code can replace the token with the refreshed one.
                    if (response.accessToken) {
                        this.accessToken = response.accessToken;
                    }

                    // Set the authenticated flag to true
                    this._authenticated = true;

                    // Store the user on the user service
                    this._userService.user = response.user;

                    // Return true
                    return of(true);
                })
            );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token and user from the local storage
        this._secureStorageService.removeItem('accessToken');
        this._secureStorageService.removeItem('user');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: {
        name: string;
        email: string;
        password: string;
        company: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean> {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken) {
            return of(false);
        }

        let user = this._secureStorageService.getItem<User>('user');
        if (user) {
            this._userService.user = user;
        } else {
            return of(false);
        }

        // If the access token exists, and it didn't expire, sign in using it
        return of(true);
    }

    createInstituteAdminPassword(request): Observable<any> {
        return this._httpClient.post('api/insadmin/verify-reset-password', request).pipe(
            switchMap((response: any) => {
                // Return a new observable with the response
                //return of(response);
                return of(response);
            })
        );
    }
}
