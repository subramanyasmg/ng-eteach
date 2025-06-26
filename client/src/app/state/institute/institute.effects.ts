import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as InstituteActions from './institute.actions';
import { InstituteService } from 'app/modules/superadmin/institutes/institute.service';

@Injectable()
export class InstituteEffects {
  constructor(private actions$: Actions, private service: InstituteService) {}

  loadInstitutes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InstituteActions.loadInstitutes),
      mergeMap(() =>
        this.service.getAll().pipe(
          map(response => InstituteActions.loadInstitutesSuccess({ institutes: response.data })),
          catchError(error => of(InstituteActions.loadInstitutesFailure({ error })))
        )
      )
    )
  );

  addInstitute$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InstituteActions.addInstitute),
      mergeMap(({ institute }) =>
        this.service.create(institute).pipe(
          map(response => InstituteActions.addInstituteSuccess({ institute: response.data })),
          catchError(error => of(InstituteActions.addInstituteFailure({ error })))
        )
      )
    )
  );

  updateInstitute$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InstituteActions.updateInstitute),
      mergeMap(({ institute }) =>
        this.service.update(institute.id,institute).pipe(
          map(response => InstituteActions.updateInstituteSuccess({ institute: response.data })),
          catchError(error => of(InstituteActions.updateInstituteFailure({ error })))
        )
      )
    )
  );

  deleteInstitute$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InstituteActions.deleteInstitute),
      mergeMap(({ id }) =>
        this.service.delete(id).pipe(
          map(() => InstituteActions.deleteInstituteSuccess({ id })),
          catchError(error => of(InstituteActions.deleteInstituteFailure({ error })))
        )
      )
    )
  );
}
