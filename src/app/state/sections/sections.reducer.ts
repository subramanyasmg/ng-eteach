import { createReducer, on } from '@ngrx/store';
import * as SectionActions from './sections.actions';
import { ISections } from 'app/models/sections.types';

export interface SectionState {
  sectionByGrades: { [gradeId: string]: ISections[] };
  loaded: boolean;
  error: any;
}

export const initialState: SectionState = {
  sectionByGrades: {},
  loaded: false,
  error: null,
};

export const sectionsReducer = createReducer(
  initialState,
  on(SectionActions.loadSections, state => ({ ...state, loaded: false, error: null })),
  on(SectionActions.loadSectionsSuccess, (state, { gradeId, sections }) => ({
    ...state,
    sectionByGrades: {
        ...state.sectionByGrades,
        [gradeId]: sections,
    },
    loaded: true,
    error: null,
  })),
  on(SectionActions.loadSectionsFailure, (state, { error }) => ({ ...state, error, loaded: false })),
  on(SectionActions.addSectionSuccess, (state, { gradeId, section }) => ({
    ...state,
    sectionByGrades: {
    ...state.sectionByGrades,
    [gradeId]: [
      ...(state.sectionByGrades[gradeId] || []),
      section,
    ]
  }
  })),
  on(SectionActions.updateSectionSuccess, (state, { gradeId, section }) => ({
  ...state,
  sectionByGrades: {
    ...state.sectionByGrades,
    [gradeId]: state.sectionByGrades[gradeId]?.map(s =>
      s.id === section.id ? section : s
    ) || []
  }
})),

on(SectionActions.deleteSectionSuccess, (state, { gradeId, sectionId }) => ({
  ...state,
  sectionByGrades: {
    ...state.sectionByGrades,
    [gradeId]: state.sectionByGrades[gradeId]?.filter(g =>
      g.id !== sectionId
    ) || []
  }
}))
);
