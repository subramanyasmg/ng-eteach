import { createReducer, on } from '@ngrx/store';
import * as SubjectActions from './subjects.actions';
import { ISubjects } from 'app/modules/admin/subjects/subject.types';

export interface SubjectState {
  subjectsByGrade: { [gradeId: string]: ISubjects[] };
  loaded: boolean;
  error: any;
}

export const initialState: SubjectState = {
  subjectsByGrade: {},
  loaded: false,
  error: null,
};

export const subjectsReducer = createReducer(
  initialState,
  on(SubjectActions.loadSubjects, state => ({ ...state, loaded: false, error: null })),
  on(SubjectActions.loadSubjectsSuccess, (state, { gradeId, subjects }) => ({
    ...state,
    subjectsByGrade: {
        ...state.subjectsByGrade,
        [gradeId]: subjects,
    },
    loaded: true,
    error: null,
  })),
  on(SubjectActions.loadSubjectsFailure, (state, { error }) => ({ ...state, error, loaded: false })),
  on(SubjectActions.addSubjectSuccess, (state, { gradeId, subject }) => ({
    ...state,
    subjectsByGrade: {
    ...state.subjectsByGrade,
    [gradeId]: [
      ...(state.subjectsByGrade[gradeId] || []),
      subject,
    ]
  }
  })),
  on(SubjectActions.updateSubjectSuccess, (state, { gradeId, subject }) => ({
  ...state,
  subjectsByGrade: {
    ...state.subjectsByGrade,
    [gradeId]: state.subjectsByGrade[gradeId]?.map(s =>
      s.id === subject.id ? subject : s
    ) || []
  }
})),

on(SubjectActions.deleteSubjectSuccess, (state, { gradeId, subjectId }) => ({
  ...state,
  subjectsByGrade: {
    ...state.subjectsByGrade,
    [gradeId]: state.subjectsByGrade[gradeId]?.filter(s =>
      s.id !== subjectId
    ) || []
  }
}))
);
