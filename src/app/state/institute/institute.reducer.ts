import { createReducer, on } from '@ngrx/store';
import * as InstituteActions from './institute.actions';
import { IInstitutes } from 'app/models/institutes.types';

export interface InstituteState {
  institutes: IInstitutes[];
  loaded: boolean;
  error: any;
}

export const initialState: InstituteState = {
  institutes: [],
  loaded: false,
  error: null,
};

export const instituteReducer = createReducer(
  initialState,
  on(InstituteActions.loadInstitutes, state => ({ ...state, loaded: false, error: null })),
  on(InstituteActions.loadInstitutesSuccess, (state, { institutes }) => ({
    ...state,
    institutes,
    loaded: true,
    error: null,
  })),
  on(InstituteActions.loadInstitutesFailure, (state, { error }) => ({ ...state, error, loaded: false })),
  on(InstituteActions.addInstituteSuccess, (state, { institute }) => ({
    ...state,
    institutes: [...state.institutes, institute],
  })),
  on(InstituteActions.updateInstituteSuccess, (state, { institute }) => ({
    ...state,
    institutes: state.institutes.map(c => c.id === institute.id ? institute : c),
  })),
  on(InstituteActions.deleteInstituteSuccess, (state, { id }) => ({
    ...state,
    institutes: state.institutes.filter(c => c.id !== id),
  }))
);
