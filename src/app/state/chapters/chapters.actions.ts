import { createAction, props } from '@ngrx/store';
import { IChapters } from 'app/models/chapters.types';

export const loadChapters = createAction('[Chapter] Load Chapters', props<{subjectId: string}>());
export const loadChaptersSuccess = createAction('[Chapter] Load Chapters Success', props<{ subjectId: string, chapters: IChapters[] }>());
export const loadChaptersFailure = createAction('[Chapter] Load Chapters Failure', props<{ error: any }>());

export const addChapter = createAction('[Chapter] Add Chapter', props<{ subjectId: string, chapters: IChapters }>());
export const addChapterSuccess = createAction('[Chapter] Add Chapter Success', props<{ subjectId: string, chapters: IChapters[] }>());
export const addChapterFailure = createAction('[Chapter] Add Chapter Failure', props<{ error: any }>());

export const updateChapter = createAction('[Chapter] Update Chapter', props<{ subjectId: string, chapter: IChapters }>());
export const updateChapterSuccess = createAction('[Chapter] Update Chapter Success', props<{ subjectId: string, chapter: IChapters }>());
export const updateChapterFailure = createAction('[Chapter] Update Chapter Failure', props<{ error: any }>());

export const deleteChapter = createAction('[Chapter] Delete Chapter', props<{ subjectId: string, chapterId: string }>());
export const deleteChapterSuccess = createAction('[Chapter] Delete Chapter Success', props<{ subjectId: string, chapterId: string }>());
export const deleteChapterFailure = createAction('[Chapter] Delete Chapter Failure', props<{ error: any }>());
