import { createFeatureSelector, createSelector } from '@ngrx/store';
import { InstituteState } from './institute.reducer';

export const selectInstituteState = createFeatureSelector<InstituteState>('institute');

export const selectAllInstitutes = createSelector(
  selectInstituteState,
  (state) => state.institutes
);

export const selectInstitutesLoaded = createSelector(
  selectInstituteState,
  (state) => state.loaded
);
