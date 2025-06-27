import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as ChapterActions from './chaptersactions';
import { ChaptersService } from 'app/modules/superadmin/chapters/chapters.service';

@Injectable()
export class ChaptersEffects {
  constructor(private actions$: Actions, private service: ChaptersService) {}

  loadChapters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChapterActions.loadChapters),
      mergeMap(({ subjectId }) =>
        this.service.getAll(subjectId).pipe(
          map(response => ChapterActions.loadChaptersSuccess({ subjectId, chapters: response.data })),
          catchError(error => of(ChapterActions.loadChaptersFailure({ error })))
        )
      )
    )
  );

  addChapter$ = createEffect(() =>
  this.actions$.pipe(
    ofType(ChapterActions.addChapter),
    mergeMap(({ subjectId, chapters }) =>
      this.service.create(subjectId, chapters).pipe(
        map((response) =>
          ChapterActions.addChapterSuccess({ subjectId, chapters: response.data })
        ),
        catchError((error) =>
          of(ChapterActions.addChapterFailure({ error }))
        )
      )
    )
  )
);

  updateGrade$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChapterActions.updateChapter),
      mergeMap(({ subjectId, chapter }) =>
        this.service.update(chapter.id,chapter).pipe(
          map(response => ChapterActions.updateChapterSuccess({ subjectId, chapter: response.data })),
          catchError(error => of(ChapterActions.updateChapterFailure({ error })))
        )
      )
    )
  );

  deleteGrade$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChapterActions.deleteChapter),
      mergeMap(({ subjectId, chapterId }) =>
        this.service.delete(subjectId).pipe(
          map(() => ChapterActions.deleteChapterSuccess({ subjectId, chapterId })),
          catchError(error => of(ChapterActions.deleteChapterFailure({ error })))
        )
      )
    )
  );
}
