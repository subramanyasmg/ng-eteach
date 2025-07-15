import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CurriculumState } from './curriculum.reducer';

export const selectCurriculumState = createFeatureSelector<CurriculumState>('curriculum');

export const selectAllCurriculums = (publisherId: string) =>  createSelector(
  selectCurriculumState,
  (state) => state.curriculums[publisherId] || []
);

export const selectCurriculumsLoaded = createSelector(
  selectCurriculumState,
  (state) => state.loaded
);
