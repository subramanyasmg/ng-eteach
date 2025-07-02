import { createAction, props } from '@ngrx/store';
import { ITeachers } from 'app/models/teachers.types';

export const loadTeachers = createAction('[Teacher] Load Teachers');
export const loadTeachersSuccess = createAction('[Teacher] Load Teachers Success', props<{ teachers: ITeachers[] }>());
export const loadTeachersFailure = createAction('[Teacher] Load Teachers Failure', props<{ error: any }>());

export const addTeacher = createAction('[Teacher] Add Teacher', props<{ teacher: ITeachers }>());
export const addTeacherSuccess = createAction('[Teacher] Add Teacher Success', props<{ teacher: ITeachers }>());
export const addTeacherFailure = createAction('[Teacher] Add Teacher Failure', props<{ error: any }>());

export const updateTeacher = createAction('[Teacher] Update Teacher', props<{ teacher: ITeachers }>());
export const updateTeacherSuccess = createAction('[Teacher] Update Teacher Success', props<{ teacher: ITeachers }>());
export const updateTeacherFailure = createAction('[Teacher] Update Teacher Failure', props<{ error: any }>());

export const deleteTeacher = createAction('[Teacher] Delete Teacher', props<{ id: string }>());
export const deleteTeacherSuccess = createAction('[Teacher] Delete Teacher Success', props<{ id: string }>());
export const deleteTeacherFailure = createAction('[Teacher] Delete Teacher Failure', props<{ error: any }>());
