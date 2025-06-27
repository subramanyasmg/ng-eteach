import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ChapterState } from './chapters.reducer';

export const selectChapterState = createFeatureSelector<ChapterState>('chapters');

export const selectChaptersByGradeId  = (subjectId: string) => createSelector(
  selectChapterState,
  (state) => state.chaptersBySubject[subjectId] || []
);

export const selectChaptersLoaded = createSelector(
  selectChapterState,
  (state) => state.loaded
);
