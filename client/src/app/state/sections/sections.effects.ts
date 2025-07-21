import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as SectionActions from './sections.actions';
import { SectionsService } from 'app/services/sections.service';

@Injectable()
export class SectionsEffects {
  constructor(private actions$: Actions, private service: SectionsService) {}

  loadSections$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SectionActions.loadSections),
      mergeMap(({ gradeId }) =>
        this.service.getAll(gradeId).pipe(
          map(response => SectionActions.loadSectionsSuccess({ gradeId, sections: response.data })),
          catchError(error => of(SectionActions.loadSectionsFailure({ error })))
        )
      )
    )
  );

  addSection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SectionActions.addSection),
      mergeMap(({ gradeId, section }) =>
        this.service.create( gradeId, section).pipe(
          map(response => SectionActions.addSectionSuccess({ gradeId, section: response.data })),
          catchError(error => of(SectionActions.addSectionFailure({ error })))
        )
      )
    )
  );

  updateSection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SectionActions.updateSection),
      mergeMap(({  gradeId, section }) =>
        this.service.update(gradeId, section).pipe(
          map(response => SectionActions.updateSectionSuccess({ gradeId, section: response.data })),
          catchError(error => of(SectionActions.updateSectionFailure({ error })))
        )
      )
    )
  );

  deleteSection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SectionActions.deleteSection),
      mergeMap(({ gradeId, sectionId }) =>
        this.service.delete(sectionId).pipe(
          map(() => SectionActions.deleteSectionSuccess({ gradeId, sectionId })),
          catchError(error => of(SectionActions.deleteSectionFailure({ error })))
        )
      )
    )
  );
}
