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
      mergeMap(({ curriculumId }) =>
        this.service.getAll(curriculumId).pipe(
          map(response => GradeActions.loadGradesSuccess({ curriculumId, grades: response.data })),
          catchError(error => of(GradeActions.loadGradesFailure({ error })))
        )
      )
    )
  );

  addGrade$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GradeActions.addGrade),
      mergeMap(({ curriculumId, grade }) =>
        this.service.create(grade).pipe(
          map(response => GradeActions.addGradeSuccess({ curriculumId, grade: response.data })),
          catchError(error => of(GradeActions.addGradeFailure({ error })))
        )
      )
    )
  );

  updateGrade$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GradeActions.updateGrade),
      mergeMap(({ curriculumId, grade }) =>
        this.service.update(grade.id,grade).pipe(
          map(response => GradeActions.updateGradeSuccess({ curriculumId, grade: response.data })),
          catchError(error => of(GradeActions.updateGradeFailure({ error })))
        )
      )
    )
  );

  deleteGrade$ = createEffect(() =>
    this.actions$.pipe(
      ofType(GradeActions.deleteGrade),
      mergeMap(({ curriculumId, gradeId }) =>
        this.service.delete(gradeId).pipe(
          map(() => GradeActions.deleteGradeSuccess({ curriculumId, gradeId })),
          catchError(error => of(GradeActions.deleteGradeFailure({ error })))
        )
      )
    )
  );
}
