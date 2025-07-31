import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanActivate,
    Router,
    RouterStateSnapshot,
} from '@angular/router';
import { UserService } from 'app/core/user/user.service';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class PrivilegeGuard implements CanActivate {
    constructor(
        private userService: UserService,
        private router: Router
    ) {}

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> {
        const allowedUserTypes = route.data['userType'];

        // Get the user from the UserService (as an observable)
        return this.userService.user$.pipe(
            first(), // Take the first emitted value (complete after getting it)
            map((user) => {
                if (!user || !user.type) {
                    // No user or user type found, deny access
                    this.router.navigate(['/unauthorized']); // or redirect to login
                    return false;
                }

                if (!allowedUserTypes.includes(user.type)) {
                    this.router.navigate(['/unauthorized']);
                    return false;
                }

                // Allowed
                return true;
            })
        );
    }
}
