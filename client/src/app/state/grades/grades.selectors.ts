import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GradeState } from './grades.reducer';

export const selectGradeState = createFeatureSelector<GradeState>('grades');

export const selectAllGrades = createSelector(
  selectGradeState,
  (state) => state.grades
);

export const selectGradesLoaded = createSelector(
  selectGradeState,
  (state) => state.loaded
);
