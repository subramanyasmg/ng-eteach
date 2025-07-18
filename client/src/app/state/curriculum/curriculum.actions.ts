import { createAction, props } from '@ngrx/store';
import { ICurriculum } from 'app/models/curriculum.types';

export const loadCurriculums = createAction('[Curriculum] Load Curriculums', props<{publisherId: string}>());
export const loadCurriculumsSuccess = createAction('[Curriculum] Load Curriculums Success', props<{  publisherId: string, curriculums: ICurriculum[] }>());
export const loadCurriculumsFailure = createAction('[Curriculum] Load Curriculums Failure', props<{ error: any }>());

export const addCurriculum = createAction('[Curriculum] Add Curriculum', props<{ publisherId: string, curriculum: ICurriculum }>());
export const addCurriculumSuccess = createAction('[Curriculum] Add Curriculum Success', props<{ publisherId: string, curriculum: ICurriculum }>());
export const addCurriculumFailure = createAction('[Curriculum] Add Curriculum Failure', props<{ error: any }>());

export const updateCurriculum = createAction('[Curriculum] Update Curriculum', props<{ publisherId: string, curriculum: ICurriculum }>());
export const updateCurriculumSuccess = createAction('[Curriculum] Update Curriculum Success', props<{ publisherId: string, curriculum: ICurriculum }>());
export const updateCurriculumFailure = createAction('[Curriculum] Update Curriculum Failure', props<{ error: any }>());

export const deleteCurriculum = createAction('[Curriculum] Delete Curriculum', props<{ publisherId: string, curriculumId: number }>());
export const deleteCurriculumSuccess = createAction('[Curriculum] Delete Curriculum Success', props<{ publisherId: string, curriculumId: number }>());
export const deleteCurriculumFailure = createAction('[Curriculum] Delete Curriculum Failure', props<{ error: any }>());
