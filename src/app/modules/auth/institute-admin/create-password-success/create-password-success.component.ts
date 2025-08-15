import {
    ChangeDetectionStrategy,
    Component,
    ViewEncapsulation,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { SnackBarService } from 'app/core/general/snackbar.service';

@Component({
    selector: 'app-create-password-success',
    standalone: true,
    imports: [RouterLink, MatButtonModule, MatIconModule],
    templateUrl: './create-password-success.component.html',
    styleUrl: './create-password-success.component.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatePasswordSuccessComponent {
    domain = window.location.hostname;

    constructor( private _snackBar: SnackBarService) {

    }

    copyDomainToClipboard(): void {
        navigator.clipboard
            .writeText(this.domain)
            .then(() => {
               this._snackBar.showSuccess(
                    'Copied to clipboard!'
                );
            })
            .catch((err) => {
                console.error('Could not copy text: ', err);
            });
    }
}
