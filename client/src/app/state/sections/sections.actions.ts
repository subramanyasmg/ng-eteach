import { createAction, props } from '@ngrx/store';
import { ISections } from 'app/models/sections.types';

export const loadSections = createAction('[Section] Load Sections', props<{gradeId: string}>());
export const loadSectionsSuccess = createAction('[Section] Load Sections Success', props<{ gradeId: string, sections: ISections[] }>());
export const loadSectionsFailure = createAction('[Section] Load Sections Failure', props<{ error: any }>());

export const addSection = createAction('[Section] Add Section', props<{ gradeId: string, section: ISections }>());
export const addSectionSuccess = createAction('[Section] Add Section Success', props<{ gradeId: string, section: ISections }>());
export const addSectionFailure = createAction('[Section] Add Section Failure', props<{ error: any }>());

export const updateSection = createAction('[Section] Update Section', props<{ gradeId: string, section: ISections }>());
export const updateSectionSuccess = createAction('[Section] Update Section Success', props<{ gradeId: string, section: ISections }>());
export const updateSectionFailure = createAction('[Section] Update Section Failure', props<{ error: any }>());

export const deleteSection = createAction('[Section] Delete Section', props<{ gradeId: string, sectionId: string }>());
export const deleteSectionSuccess = createAction('[Section] Delete Section Success', props<{ gradeId: string, sectionId: string }>());
export const deleteSectionFailure = createAction('[Section] Delete Section Failure', props<{ error: any }>());
