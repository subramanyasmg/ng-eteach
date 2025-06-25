import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as GradeActions from './grades.actions';
import { GradesService } from 'app/modules/admin/grades/grades.service';

@Injectable()
export class GradesEffects {
  constructor(private actions$: Actions, private service: GradesService) {}

  loadGrades$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GradeActions.loadGrades),
      mergeMap(() =>
        this.service.getAll().pipe(
          map(response => GradeActions.loadGradesSuccess({ grades: response.data })),
          catchError(error => of(GradeActions.loadGradesFailure({ error })))
        )
      )
    )
  );

  addGrade$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GradeActions.addGrade),
      mergeMap(({ grade }) =>
        this.service.create(grade).pipe(
          map(response => GradeActions.addGradeSuccess({ grade: response.data })),
          catchError(error => of(GradeActions.addGradeFailure({ error })))
        )
      )
    )
  );

  updateGrade$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GradeActions.updateGrade),
      mergeMap(({ grade }) =>
        this.service.update(grade.id,grade).pipe(
          map(response => GradeActions.updateGradeSuccess({ grade: response.data })),
          catchError(error => of(GradeActions.updateGradeFailure({ error })))
        )
      )
    )
  );

  deleteGrade$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GradeActions.deleteGrade),
      mergeMap(({ id }) =>
        this.service.delete(id).pipe(
          map(() => GradeActions.deleteGradeSuccess({ id })),
          catchError(error => of(GradeActions.deleteGradeFailure({ error })))
        )
      )
    )
  );
}
