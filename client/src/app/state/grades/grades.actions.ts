import { createAction, props } from '@ngrx/store';
import { IGrades } from 'app/modules/admin/grades/grades.types';

export const loadGrades = createAction('[Grade] Load Grades');
export const loadGradesSuccess = createAction('[Grade] Load Grades Success', props<{ grades: IGrades[] }>());
export const loadGradesFailure = createAction('[Grade] Load Grades Failure', props<{ error: any }>());

export const addGrade = createAction('[Grade] Add Grade', props<{ grade: IGrades }>());
export const addGradeSuccess = createAction('[Grade] Add Grade Success', props<{ grade: IGrades }>());
export const addGradeFailure = createAction('[Grade] Add Grade Failure', props<{ error: any }>());

export const updateGrade = createAction('[Grade] Update Grade', props<{ grade: IGrades }>());
export const updateGradeSuccess = createAction('[Grade] Update Grade Success', props<{ grade: IGrades }>());
export const updateGradeFailure = createAction('[Grade] Update Grade Failure', props<{ error: any }>());

export const deleteGrade = createAction('[Grade] Delete Grade', props<{ id: string }>());
export const deleteGradeSuccess = createAction('[Grade] Delete Grade Success', props<{ id: string }>());
export const deleteGradeFailure = createAction('[Grade] Delete Grade Failure', props<{ error: any }>());
