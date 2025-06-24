import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CurriculumState } from './curriculum.reducer';

export const selectCurriculumState = createFeatureSelector<CurriculumState>('curriculum');

export const selectAllCurriculums = createSelector(
  selectCurriculumState,
  (state) => state.curriculums
);

export const selectCurriculumsLoaded = createSelector(
  selectCurriculumState,
  (state) => state.loaded
);
