import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SubjectState } from './subjects.reducer';

export const selectSubjectState = createFeatureSelector<SubjectState>('subjects');

export const selectSubjectsByGradeId  = (gradeId: string) => createSelector(
  selectSubjectState,
  (state) => state.subjectsByGrade[gradeId] || []
);

export const selectSubjectsLoaded = createSelector(
  selectSubjectState,
  (state) => state.loaded
);
