import { createAction, props } from '@ngrx/store';
import { ISubjects } from 'app/modules/admin/subjects/subject.types';

export const loadSubjects = createAction('[Subject] Load Subjects', props<{gradeId: string}>());
export const loadSubjectsSuccess = createAction('[Subject] Load Subjects Success', props<{ gradeId: string, subjects: ISubjects[] }>());
export const loadSubjectsFailure = createAction('[Subject] Load Subjects Failure', props<{ error: any }>());

export const addSubject = createAction('[Subject] Add Subject', props<{ gradeId: string, subject: ISubjects }>());
export const addSubjectSuccess = createAction('[Subject] Add Subject Success', props<{ gradeId: string, subjects: ISubjects[] }>());
export const addSubjectFailure = createAction('[Subject] Add Subject Failure', props<{ error: any }>());

export const updateSubject = createAction('[Subject] Update Subject', props<{ gradeId: string, subject: ISubjects }>());
export const updateSubjectSuccess = createAction('[Subject] Update Subject Success', props<{ gradeId: string, subject: ISubjects }>());
export const updateSubjectFailure = createAction('[Subject] Update Subject Failure', props<{ error: any }>());

export const deleteSubject = createAction('[Subject] Delete Subject', props<{ gradeId: string, subjectId: string }>());
export const deleteSubjectSuccess = createAction('[Subject] Delete Subject Success', props<{ gradeId: string, subjectId: string }>());
export const deleteSubjectFailure = createAction('[Subject] Delete Subject Failure', props<{ error: any }>());
