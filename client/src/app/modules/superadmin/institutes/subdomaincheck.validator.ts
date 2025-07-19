import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { InstituteService } from 'app/services/institute.service';
import { Observable, of, timer } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

export function subdomainAvailabilityValidator(service: InstituteService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        if (!control.value) {
            return of(null);
        }

        return timer(500).pipe(
            switchMap(() => service.checkSubdomainAvailability(control.value)),
            map(isAvailable => (isAvailable ? null : { subdomainTaken: true })),
            catchError(() => of(null)) 
        );
    };
}