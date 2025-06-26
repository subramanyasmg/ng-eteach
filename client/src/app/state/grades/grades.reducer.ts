import { createReducer, on } from '@ngrx/store';
import * as GradeActions from './grades.actions';
import { IGrades } from 'app/modules/admin/grades/grades.types';

export interface GradeState {
  gradesByCurriculum: { [curriculumId: string]: IGrades[] };
  loaded: boolean;
  error: any;
}

export const initialState: GradeState = {
  gradesByCurriculum: {},
  loaded: false,
  error: null,
};

export const gradeReducer = createReducer(
  initialState,
  on(GradeActions.loadGrades, state => ({ ...state, loaded: false, error: null })),
  on(GradeActions.loadGradesSuccess, (state, { curriculumId, grades }) => ({
    ...state,
    gradesByCurriculum: {
        ...state.gradesByCurriculum,
        [curriculumId]: grades,
    },
    loaded: true,
    error: null,
  })),
  on(GradeActions.loadGradesFailure, (state, { error }) => ({ ...state, error, loaded: false })),
  on(GradeActions.addGradeSuccess, (state, { curriculumId, grade }) => ({
    ...state,
    gradesByCurriculum: {
    ...state.gradesByCurriculum,
    [curriculumId]: [
      ...(state.gradesByCurriculum[curriculumId] || []),
      grade,
    ]
  }
  })),
  on(GradeActions.updateGradeSuccess, (state, { curriculumId, grade }) => ({
  ...state,
  gradesByCurriculum: {
    ...state.gradesByCurriculum,
    [curriculumId]: state.gradesByCurriculum[curriculumId]?.map(g =>
      g.id === grade.id ? grade : g
    ) || []
  }
})),

on(GradeActions.deleteGradeSuccess, (state, { curriculumId, gradeId }) => ({
  ...state,
  gradesByCurriculum: {
    ...state.gradesByCurriculum,
    [curriculumId]: state.gradesByCurriculum[curriculumId]?.filter(g =>
      g.id !== gradeId
    ) || []
  }
}))
);
