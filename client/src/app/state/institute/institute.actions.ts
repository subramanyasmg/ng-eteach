import { createAction, props } from '@ngrx/store';
import { IInstitutes } from 'app/models/institutes.types';

export const loadInstitutes = createAction('[Institute] Load Institutes');
export const loadInstitutesSuccess = createAction('[Institute] Load Institutes Success', props<{ institutes: IInstitutes[] }>());
export const loadInstitutesFailure = createAction('[Institute] Load Institutes Failure', props<{ error: any }>());

export const addInstitute = createAction('[Institute] Add Institute', props<{ institute: IInstitutes }>());
export const addInstituteSuccess = createAction('[Institute] Add Institute Success', props<{ institute: IInstitutes }>());
export const addInstituteFailure = createAction('[Institute] Add Institute Failure', props<{ error: any }>());

export const updateInstitute = createAction('[Institute] Update Institute', props<{ institute: IInstitutes }>());
export const updateInstituteSuccess = createAction('[Institute] Update Institute Success', props<{ institute: IInstitutes }>());
export const updateInstituteFailure = createAction('[Institute] Update Institute Failure', props<{ error: any }>());

export const deleteInstitute = createAction('[Institute] Delete Institute', props<{ id: number }>());
export const deleteInstituteSuccess = createAction('[Institute] Delete Institute Success', props<{ id: number }>());
export const deleteInstituteFailure = createAction('[Institute] Delete Institute Failure', props<{ error: any }>());
