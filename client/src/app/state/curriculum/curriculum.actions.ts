import { createAction, props } from '@ngrx/store';
import { ICurriculum } from 'app/modules/admin/curriculum/curriculum.types';

export const loadCurriculums = createAction('[Curriculum] Load Curriculums');
export const loadCurriculumsSuccess = createAction('[Curriculum] Load Curriculums Success', props<{ curriculums: ICurriculum[] }>());
export const loadCurriculumsFailure = createAction('[Curriculum] Load Curriculums Failure', props<{ error: any }>());

export const addCurriculum = createAction('[Curriculum] Add Curriculum', props<{ curriculum: ICurriculum }>());
export const addCurriculumSuccess = createAction('[Curriculum] Add Curriculum Success', props<{ curriculum: ICurriculum }>());
export const addCurriculumFailure = createAction('[Curriculum] Add Curriculum Failure', props<{ error: any }>());

export const updateCurriculum = createAction('[Curriculum] Update Curriculum', props<{ curriculum: ICurriculum }>());
export const updateCurriculumSuccess = createAction('[Curriculum] Update Curriculum Success', props<{ curriculum: ICurriculum }>());
export const updateCurriculumFailure = createAction('[Curriculum] Update Curriculum Failure', props<{ error: any }>());

export const deleteCurriculum = createAction('[Curriculum] Delete Curriculum', props<{ id: string }>());
export const deleteCurriculumSuccess = createAction('[Curriculum] Delete Curriculum Success', props<{ id: string }>());
export const deleteCurriculumFailure = createAction('[Curriculum] Delete Curriculum Failure', props<{ error: any }>());
