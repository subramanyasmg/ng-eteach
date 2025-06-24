import { createReducer, on } from '@ngrx/store';
import * as CurriculumActions from './curriculum.actions';
import { ICurriculum } from 'app/modules/admin/curriculum/curriculum.types';

export interface CurriculumState {
  curriculums: ICurriculum[];
  loaded: boolean;
  error: any;
}

export const initialState: CurriculumState = {
  curriculums: [],
  loaded: false,
  error: null,
};

export const curriculumReducer = createReducer(
  initialState,
  on(CurriculumActions.loadCurriculums, state => ({ ...state, loaded: false, error: null })),
  on(CurriculumActions.loadCurriculumsSuccess, (state, { curriculums }) => ({
    ...state,
    curriculums,
    loaded: true,
    error: null,
  })),
  on(CurriculumActions.loadCurriculumsFailure, (state, { error }) => ({ ...state, error, loaded: false })),
  on(CurriculumActions.addCurriculumSuccess, (state, { curriculum }) => ({
    ...state,
    curriculums: [...state.curriculums, curriculum],
  })),
  on(CurriculumActions.updateCurriculumSuccess, (state, { curriculum }) => ({
    ...state,
    curriculums: state.curriculums.map(c => c.id === curriculum.id ? curriculum : c),
  })),
  on(CurriculumActions.deleteCurriculumSuccess, (state, { id }) => ({
    ...state,
    curriculums: state.curriculums.filter(c => c.id !== id),
  }))
);
