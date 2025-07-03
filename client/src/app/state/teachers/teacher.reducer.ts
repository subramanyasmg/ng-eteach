import { createReducer, on } from '@ngrx/store';
import * as TeacherActions from './teacher.actions';
import { ITeachers } from 'app/models/teachers.types';

export interface TeacherState {
  teachers: ITeachers[];
  loaded: boolean;
  error: any;
}

export const initialState: TeacherState = {
  teachers: [],
  loaded: false,
  error: null,
};

export const teacherReducer = createReducer(
  initialState,
  on(TeacherActions.loadTeachers, state => ({ ...state, loaded: false, error: null })),
  on(TeacherActions.loadTeachersSuccess, (state, { teachers }) => ({
    ...state,
    teachers,
    loaded: true,
    error: null,
  })),
  on(TeacherActions.loadTeachersFailure, (state, { error }) => ({ ...state, error, loaded: false })),
  on(TeacherActions.addTeacherSuccess, (state, { teacher }) => ({
    ...state,
    teachers: [...state.teachers, teacher],
  })),
  on(TeacherActions.updateTeacherSuccess, (state, { teacher }) => ({
    ...state,
    teachers: state.teachers.map(c => c.id === teacher.id ? teacher : c),
  })),
  on(TeacherActions.deleteTeacherSuccess, (state, { id }) => ({
    ...state,
    teachers: state.teachers.filter(c => c.id !== id),
  }))
);
