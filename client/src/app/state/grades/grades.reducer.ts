import { createReducer, on } from '@ngrx/store';
import * as GradeActions from './grades.actions';
import { IGrades } from 'app/modules/admin/grades/grades.types';

export interface GradeState {
  grades: IGrades[];
  loaded: boolean;
  error: any;
}

export const initialState: GradeState = {
  grades: [],
  loaded: false,
  error: null,
};

export const gradeReducer = createReducer(
  initialState,
  on(GradeActions.loadGrades, state => ({ ...state, loaded: false, error: null })),
  on(GradeActions.loadGradesSuccess, (state, { grades }) => ({
    ...state,
    grades,
    loaded: true,
    error: null,
  })),
  on(GradeActions.loadGradesFailure, (state, { error }) => ({ ...state, error, loaded: false })),
  on(GradeActions.addGradeSuccess, (state, { grade }) => ({
    ...state,
    grades: [...state.grades, grade],
  })),
  on(GradeActions.updateGradeSuccess, (state, { grade }) => ({
    ...state,
    grades: state.grades.map(c => c.id === grade.id ? grade : c),
  })),
  on(GradeActions.deleteGradeSuccess, (state, { id }) => ({
    ...state,
    grades: state.grades.filter(c => c.id !== id),
  }))
);
