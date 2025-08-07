import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { USER_TYPES } from 'app/constants/usertypes';
import { AuthService } from 'app/core/auth/auth.service';
import { SecureSessionStorageService } from 'app/services/securestorage.service';
import { take } from 'rxjs';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    imports: [
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        CommonModule,
    ],
})
export class InstituteAdminSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;
    schoolLogo = '';
    schoolName = '';
    schoolCover = '';
    isOrgValid = false;
    isLoading = true;

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router,
        private _secureStorageService: SecureSessionStorageService
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._authService
            .getOrgDetails()
            .pipe(take(1))
            .subscribe(
                (response) => {
                    console.log(response);
                    this.isLoading = false;
                    if (response.success) {
                        this.isOrgValid = true;
                        this.schoolLogo = response.data.logo
                            ? response.data.logo
                            : 'images/logo_placeholder.png';
                        this.schoolName = response.data.institute_name;
                        this.schoolCover = response.data.custom
                            ? response.data.photo
                            : 'images/placeholder.jpg';

                        this._secureStorageService.setItem('license', {
                            total_licenses: response.data.total_licenses,
                            license_end: response.data.license_end
                        } );
                    }
                },
                (error) => {
                    console.error('error', error);
                    this.isOrgValid = false;
                    this.isLoading = false;
                }
            );

        // Create the form
        this.signInForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Sign in
     */
    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign in
        this._authService
            .signIn(this.signInForm.value, USER_TYPES.INSTITUTE_ADMIN)
            .subscribe(
                (response) => {
                    let redirectURL = '';

                    if (response?.type === USER_TYPES.INSTITUTE_ADMIN) {
                        redirectURL =
                            this._activatedRoute.snapshot.queryParamMap.get(
                                'redirectURL'
                            ) || '/institute-admin-signed-in-redirect';
                    }
                    if (response?.type === USER_TYPES.TEACHER) {
                        redirectURL =
                            this._activatedRoute.snapshot.queryParamMap.get(
                                'redirectURL'
                            ) || '/teacher-signed-in-redirect';
                    }

                    // Navigate to the redirect url
                    this._router.navigateByUrl(redirectURL);
                },
                (response) => {
                    this.handleLoginError();
                }
            );
    }

    handleLoginError(message = 'Wrong Email ID or Password') {
        // Re-enable the form
        this.signInForm.enable();

        // Reset the form
        this.signInNgForm.resetForm();

        // Set the alert
        this.alert = {
            type: 'error',
            message,
        };

        // Show the alert
        this.showAlert = true;
    }
}
