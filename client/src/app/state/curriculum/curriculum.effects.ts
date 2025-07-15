import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as CurriculumActions from './curriculum.actions';
import { CurriculumService } from 'app/services/curriculum.service';

@Injectable()
export class CurriculumEffects {
  constructor(private actions$: Actions, private service: CurriculumService) {}

  loadCurriculums$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CurriculumActions.loadCurriculums),
      mergeMap(({publisherId}) =>
        this.service.getAll(publisherId).pipe(
          map(response => CurriculumActions.loadCurriculumsSuccess({ publisherId, curriculums: response.data })),
          catchError(error => of(CurriculumActions.loadCurriculumsFailure({ error })))
        )
      )
    )
  );

  addCurriculum$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CurriculumActions.addCurriculum),
      mergeMap(({ publisherId, curriculum }) =>
        this.service.create(publisherId, curriculum).pipe(
          map(response => CurriculumActions.addCurriculumSuccess({ publisherId, curriculum: response.data })),
          catchError(error => of(CurriculumActions.addCurriculumFailure({ error })))
        )
      )
    )
  );

  updateCurriculum$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CurriculumActions.updateCurriculum),
      mergeMap(({ publisherId, curriculum }) =>
        this.service.update(curriculum.id,curriculum).pipe(
          map(response => CurriculumActions.updateCurriculumSuccess({ publisherId, curriculum: response })),
          catchError(error => of(CurriculumActions.updateCurriculumFailure({ error })))
        )
      )
    )
  );

  deleteCurriculum$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CurriculumActions.deleteCurriculum),
      mergeMap(({ publisherId, curriculumId }) =>
        this.service.delete(curriculumId).pipe(
          map(() => CurriculumActions.deleteCurriculumSuccess({ publisherId, curriculumId })),
          catchError(error => of(CurriculumActions.deleteCurriculumFailure({ error })))
        )
      )
    )
  );
}
