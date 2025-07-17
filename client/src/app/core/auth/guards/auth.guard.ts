import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from 'app/core/auth/auth.service';
import { of, switchMap } from 'rxjs';

export const AuthGuard: CanActivateFn | CanActivateChildFn = (route, state) => {
    const router: Router = inject(Router);

    // Check the authentication status
    return inject(AuthService)
        .check()
        .pipe(
            switchMap((authenticated) => {
                // If the user is not authenticated...
                if (!authenticated) {
                    const isInstitutePage = state.url.includes('/institute');

                    const redirectURL = state.url === '/sign-out' ? '' : `redirectURL=${state.url}`;

                    const loginPath = isInstitutePage ? '/institute/sign-in' : '/sign-in';
                    const fullRedirectUrl = redirectURL ? `${loginPath}?${redirectURL}` : loginPath;

                    const urlTree = router.parseUrl(fullRedirectUrl);
                    return of(urlTree);
                }
                // Allow the access
                return of(true);
            })
        );
};
