import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { USER_TYPES } from 'app/constants/usertypes';
import { AuthService } from 'app/core/auth/auth.service';
import { User } from 'app/core/user/user.types';
import { SecureSessionStorageService } from 'app/services/securestorage.service';
import { of, switchMap } from 'rxjs';

export const NoAuthGuard: CanActivateFn | CanActivateChildFn = (
    route,
    state
) => {
    const router: Router = inject(Router);
    const authService = inject(AuthService);
    const secureStorageService = inject(SecureSessionStorageService);

    // Check the authentication status
    return authService.check().pipe(
        switchMap((authenticated) => {
            if (authenticated) {
                const user = secureStorageService.getItem<User>('user');

                if (user?.type === USER_TYPES.SUPER_ADMIN) {
                    return of(router.parseUrl('/signed-in-redirect'));
                } else if (user?.type === USER_TYPES.INSTITUTE_ADMIN) {
                    return of(router.parseUrl('/institute-admin-signed-in-redirect'));
                } else if (user?.type === USER_TYPES.TEACHER) {
                    return of(router.parseUrl('/teacher-signed-in-redirect'));
                }
            }

            // User is not authenticated
            return of(true);
        })
    );
};
