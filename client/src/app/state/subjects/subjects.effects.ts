import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as SubjectActions from './subjects.actions';
import { SubjectsService } from 'app/modules/admin/subjects/subjects.service';

@Injectable()
export class SubjectsEffects {
  constructor(private actions$: Actions, private service: SubjectsService) {}

  loadSubjects$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubjectActions.loadSubjects),
      mergeMap(({ gradeId }) =>
        this.service.getAll(gradeId).pipe(
          map(response => SubjectActions.loadSubjectsSuccess({ gradeId, subjects: response.data })),
          catchError(error => of(SubjectActions.loadSubjectsFailure({ error })))
        )
      )
    )
  );

  addSubject$ = createEffect(() =>
  this.actions$.pipe(
    ofType(SubjectActions.addSubject),
    mergeMap(({ gradeId, subject }) =>
      this.service.create(gradeId, subject).pipe(
        map((response) =>
          SubjectActions.addSubjectSuccess({ gradeId, subjects: response.data })
        ),
        catchError((error) =>
          of(SubjectActions.addSubjectFailure({ error }))
        )
      )
    )
  )
);

  updateGrade$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubjectActions.updateSubject),
      mergeMap(({ gradeId, subject }) =>
        this.service.update(subject.id,subject).pipe(
          map(response => SubjectActions.updateSubjectSuccess({ gradeId, subject: response.data })),
          catchError(error => of(SubjectActions.updateSubjectFailure({ error })))
        )
      )
    )
  );

  deleteGrade$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SubjectActions.deleteSubject),
      mergeMap(({ gradeId, subjectId }) =>
        this.service.delete(gradeId).pipe(
          map(() => SubjectActions.deleteSubjectSuccess({ gradeId, subjectId })),
          catchError(error => of(SubjectActions.deleteSubjectFailure({ error })))
        )
      )
    )
  );
}
