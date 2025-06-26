import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as CurriculumActions from './curriculum.actions';
import { CurriculumService } from 'app/modules/superadmin/curriculum/curriculum-list/curriculum.service';

@Injectable()
export class CurriculumEffects {
  constructor(private actions$: Actions, private service: CurriculumService) {}

  loadCurriculums$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CurriculumActions.loadCurriculums),
      mergeMap(() =>
        this.service.getAll().pipe(
          map(response => CurriculumActions.loadCurriculumsSuccess({ curriculums: response.data })),
          catchError(error => of(CurriculumActions.loadCurriculumsFailure({ error })))
        )
      )
    )
  );

  addCurriculum$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CurriculumActions.addCurriculum),
      mergeMap(({ curriculum }) =>
        this.service.create(curriculum).pipe(
          map(response => CurriculumActions.addCurriculumSuccess({ curriculum: response.data })),
          catchError(error => of(CurriculumActions.addCurriculumFailure({ error })))
        )
      )
    )
  );

  updateCurriculum$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CurriculumActions.updateCurriculum),
      mergeMap(({ curriculum }) =>
        this.service.update(curriculum.id,curriculum).pipe(
          map(response => CurriculumActions.updateCurriculumSuccess({ curriculum: response.data })),
          catchError(error => of(CurriculumActions.updateCurriculumFailure({ error })))
        )
      )
    )
  );

  deleteCurriculum$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CurriculumActions.deleteCurriculum),
      mergeMap(({ id }) =>
        this.service.delete(id).pipe(
          map(() => CurriculumActions.deleteCurriculumSuccess({ id })),
          catchError(error => of(CurriculumActions.deleteCurriculumFailure({ error })))
        )
      )
    )
  );
}
