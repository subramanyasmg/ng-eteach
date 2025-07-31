import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as ChapterActions from './chapters.actions';
import { ChaptersService } from 'app/services/chapters.service';

@Injectable()
export class ChaptersEffects {
  constructor(private actions$: Actions, private service: ChaptersService) {}

  loadChapters$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChapterActions.loadChapters),
      mergeMap(({ subjectId }) =>
        this.service.getAll(subjectId).pipe(
          map(response => ChapterActions.loadChaptersSuccess({ subjectId, chapters: response.data.rows })),
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

  updateChapter$ = createEffect(() =>
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

  deleteChapter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ChapterActions.deleteChapter),
      mergeMap(({ subjectId, chapterId }) =>
        this.service.delete(chapterId).pipe(
          map(() => ChapterActions.deleteChapterSuccess({ subjectId, chapterId })),
          catchError(error => of(ChapterActions.deleteChapterFailure({ error })))
        )
      )
    )
  );
}
