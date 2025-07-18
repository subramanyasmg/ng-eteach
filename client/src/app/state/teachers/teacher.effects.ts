import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as TeacherActions from './teacher.actions';
import { TeachersService } from 'app/services/teachers.service';

@Injectable()
export class TeacherEffects {
  constructor(private actions$: Actions, private service: TeachersService) {}

  loadTeachers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeacherActions.loadTeachers),
      mergeMap(() =>
        this.service.getAll().pipe(
          map(response => TeacherActions.loadTeachersSuccess({ teachers: response.data })),
          catchError(error => of(TeacherActions.loadTeachersFailure({ error })))
        )
      )
    )
  );

  addTeacher$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeacherActions.addTeacher),
      mergeMap(({ teacher }) =>
        this.service.create(teacher).pipe(
          map(response => TeacherActions.addTeacherSuccess({ teacher: response.data })),
          catchError(error => of(TeacherActions.addTeacherFailure({ error })))
        )
      )
    )
  );

  updateTeacher$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeacherActions.updateTeacher),
      mergeMap(({ teacher }) =>
        this.service.update(teacher.id,teacher).pipe(
          map(response => TeacherActions.updateTeacherSuccess({ teacher: response.data })),
          catchError(error => of(TeacherActions.updateTeacherFailure({ error })))
        )
      )
    )
  );

  deleteTeacher$ = createEffect(() =>
    this.actions$.pipe(
      ofType(TeacherActions.deleteTeacher),
      mergeMap(({ id }) =>
        this.service.delete(id).pipe(
          map(() => TeacherActions.deleteTeacherSuccess({ id })),
          catchError(error => of(TeacherActions.deleteTeacherFailure({ error })))
        )
      )
    )
  );
}
