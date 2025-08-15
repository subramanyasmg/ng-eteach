import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TeacherState } from './teacher.reducer';

export const selectTeacherState = createFeatureSelector<TeacherState>('teachers');

export const selectAllTeachers = createSelector(
  selectTeacherState,
  (state) => state.teachers
);

export const selectTeachersLoaded = createSelector(
  selectTeacherState,
  (state) => state.loaded
);
