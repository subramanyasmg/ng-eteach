import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { FuseFullscreenComponent } from '@fuse/components/fullscreen';
import { FuseLoadingBarComponent } from '@fuse/components/loading-bar';
import {
    FuseNavigationService,
    FuseVerticalNavigationComponent,
} from '@fuse/components/navigation';
import { FuseMediaWatcherService } from '@fuse/services/media-watcher';
import { USER_TYPES } from 'app/constants/usertypes';
import { UserService } from 'app/core/user/user.service';
import { UserComponent } from 'app/layout/common/user/user.component';
import {
    instituteAdmin,
    publisher,
    superAdmin,
    teacher,
} from 'app/mock-api/common/navigation/data';
import { Subject, takeUntil } from 'rxjs';
import { BreadcrumbComponent } from '../../../common/breadcrumb/breadcrumb.component';

@Component({
    selector: 'classic-layout',
    templateUrl: './classic.component.html',
    encapsulation: ViewEncapsulation.None,
    imports: [
        FuseLoadingBarComponent,
        FuseVerticalNavigationComponent,
        MatButtonModule,
        MatIconModule,
        FuseFullscreenComponent,
        UserComponent,
        RouterOutlet,
        BreadcrumbComponent,
    ],
})
export class ClassicLayoutComponent implements OnInit, OnDestroy {
    isScreenSmall: boolean;
    navigationData;
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _router: Router,
        private _userService: UserService,
        private _fuseMediaWatcherService: FuseMediaWatcherService,
        private _fuseNavigationService: FuseNavigationService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for current year
     */
    get currentYear(): number {
        return new Date().getFullYear();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user) => {
                switch (user.type) {
                    case USER_TYPES.INSTITUTE_ADMIN: {
                        this.navigationData = instituteAdmin;
                    }
                    break;
                    case USER_TYPES.SUPER_ADMIN: {
                        this.navigationData = superAdmin;
                    }
                    break;
                    case USER_TYPES.PUBLISHER_ADMIN: 
                    case USER_TYPES.PUBLISHER_USER:{
                        this.navigationData = publisher;
                    }
                    break;
                    case USER_TYPES.TEACHER: {
                        this.navigationData = teacher;
                    }
                    break;
                    default:
                        this.navigationData = [];
                        break;
                }
            });

        // Subscribe to media changes
        this._fuseMediaWatcherService.onMediaChange$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(({ matchingAliases }) => {
                // Check if the screen is small
                this.isScreenSmall = !matchingAliases.includes('md');
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle navigation
     *
     * @param name
     */
    toggleNavigation(name: string): void {
        // Get the navigation
        const navigation =
            this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(
                name
            );

        if (navigation) {
            // Toggle the opened status
            navigation.toggle();
        }
    }
}
