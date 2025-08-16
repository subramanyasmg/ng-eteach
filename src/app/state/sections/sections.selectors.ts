import { createFeatureSelector, createSelector } from '@ngrx/store';
import { SectionState } from './sections.reducer';

export const selectSectionState = createFeatureSelector<SectionState>('sections');

export const selectSectionsByGradeId  = (gradeId: string) => createSelector(
  selectSectionState,
  (state) => state.sectionByGrades[gradeId] || []
);

export const selectSectionsLoaded = createSelector(
  selectSectionState,
  (state) => state.loaded
);
