import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class SnackBarService {
    constructor(private _snackBar: MatSnackBar) {}

    showSuccess(message, duration = 10) {
        this._snackBar.open(message, 'Close', {
            panelClass: 'success-alert',
            duration: duration * 1000,
        });
    }

    showError(message, duration = 10) {
        this._snackBar.open(message, 'Close', {
            panelClass: 'error-alert',
            duration: duration * 1000,
        });
    }
}
