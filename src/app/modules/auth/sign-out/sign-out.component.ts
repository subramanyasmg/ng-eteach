import { I18nPluralPipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { USER_TYPES } from 'app/constants/usertypes';
import { AuthService } from 'app/core/auth/auth.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { Subject, finalize, takeUntil, takeWhile, tap, timer } from 'rxjs';

@Component({
    selector: 'auth-sign-out',
    templateUrl: './sign-out.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [RouterLink, I18nPluralPipe],
})
export class AuthSignOutComponent implements OnInit, OnDestroy {
    countdown: number = 5;
    countdownMapping: any = {
        '=1': '# second',
        other: '# seconds',
    };
    signOutURL = '';
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _router: Router,
        private _userService: UserService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Sign out
        this._authService.signOut();

        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: User) => {

                if (user.type === USER_TYPES.INSTITUTE_ADMIN || user.type === USER_TYPES.TEACHER) {
                    this.signOutURL = 'sign-in';
                } else if (user.type === USER_TYPES.SUPER_ADMIN) {
                    this.signOutURL = 'admin/sign-in';
                }
                // Redirect after the countdown
                timer(1000, 1000)
                    .pipe(
                        finalize(() => {
                            this._router.navigate([this.signOutURL]);
                        }),
                        takeWhile(() => this.countdown > 0),
                        takeUntil(this._unsubscribeAll),
                        tap(() => this.countdown--)
                    )
                    .subscribe();
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next(null);
        this._unsubscribeAll.complete();
    }
}
