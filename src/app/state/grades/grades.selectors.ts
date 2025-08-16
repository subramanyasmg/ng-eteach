import { createFeatureSelector, createSelector } from '@ngrx/store';
import { GradeState } from './grades.reducer';

export const selectGradeState = createFeatureSelector<GradeState>('grades');

export const selectGradesByCurriculumId  = (curriculumId: string) => createSelector(
  selectGradeState,
  (state) => state.gradesByCurriculum[curriculumId] || []
);

export const selectGradesLoaded = createSelector(
  selectGradeState,
  (state) => state.loaded
);
