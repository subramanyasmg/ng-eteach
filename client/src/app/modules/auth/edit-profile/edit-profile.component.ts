import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FuseValidators } from '@fuse/validators';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { AuthService } from 'app/core/auth/auth.service';
import { SnackBarService } from 'app/core/general/snackbar.service';
import { BreadcrumbService } from 'app/layout/common/breadcrumb/breadcrumb.service';

@Component({
    selector: 'app-edit-profile',
    imports: [
        TranslocoModule,
        CommonModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatIconModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './edit-profile.component.html',
    styleUrl: './edit-profile.component.scss',
})
export class EditProfileComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;
    resetPasswordForm: UntypedFormGroup;

    constructor(
        private titleService: BreadcrumbService,
        private _authService: AuthService,
        private _snackBar: SnackBarService,
        private _formBuilder: UntypedFormBuilder,
        private translocoService: TranslocoService
    ) {
        this.titleService.setBreadcrumb([
            {
                label: this.translocoService.translate(
                    'navigation.editProfile'
                ),
                url: 'edit-profile',
            },
            {
                label: this.translocoService.translate(
                    'navigation.changePassword'
                ),
                url: '',
            },
        ]);
    }

    ngOnInit(): void {
        // Create the form
        this.resetPasswordForm = this._formBuilder.group(
            {
                password: ['', Validators.required],
                cpassword: ['', Validators.required],
            },
            {
                validators: FuseValidators.mustMatch('password', 'cpassword'),
            }
        );
    }

    resetPassword() {
       // Return if the form is invalid
        if (this.resetPasswordForm.invalid) {
            return;
        }

        // Disable the form
        this.resetPasswordForm.disable();

        // Sign in
        this._authService.resetProfilePassword(this.resetPasswordForm.value.password).subscribe(
            (response) => {
                console.log(response);
                this.resetPasswordForm.enable();
                if (response.success && response.status === 200) {
                    this._snackBar.showSuccess(
                          this.translocoService.translate('profile.password_change_success')
                      );
                } else {
                    this._snackBar.showError(
                        `Error: ${response.message}`
                    );
                }
            },
            (response) => {
              this.resetPasswordForm.enable();
               this._snackBar.showError(
                      `Error: Something went wrong.`
                  );
            }
        );
    }
}
