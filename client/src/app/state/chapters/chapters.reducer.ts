import { createReducer, on } from '@ngrx/store';
import * as ChapterActions from './chaptersactions';
import { IChapters } from 'app/modules/superadmin/chapters/chapters.types';

export interface ChapterState {
    chaptersBySubject: { [subjectId: string]: IChapters[] };
    loaded: boolean;
    error: any;
}

export const initialState: ChapterState = {
    chaptersBySubject: {},
    loaded: false,
    error: null,
};

export const chaptersReducer = createReducer(
    initialState,
    on(ChapterActions.loadChapters, (state) => ({
        ...state,
        loaded: false,
        error: null,
    })),
    on(ChapterActions.loadChaptersSuccess, (state, { subjectId, chapters }) => ({
        ...state,
        chaptersBySubject: {
            ...state.chaptersBySubject,
            [subjectId]: chapters,
        },
        loaded: true,
        error: null,
    })),
    on(ChapterActions.loadChaptersFailure, (state, { error }) => ({
        ...state,
        error,
        loaded: false,
    })),
    on(ChapterActions.addChapterSuccess, (state, { subjectId, chapters }) => ({
        ...state,
        chaptersBySubject: {
            ...state.chaptersBySubject,
            [subjectId]: [...(state.chaptersBySubject[subjectId] || []), ...chapters ],
        },
    })),
    on(ChapterActions.updateChapterSuccess, (state, { subjectId, chapter }) => ({
        ...state,
        chaptersBySubject: {
            ...state.chaptersBySubject,
            [subjectId]:
                state.chaptersBySubject[subjectId]?.map((c) =>
                    c.id === chapter.id ? chapter : c
                ) || [],
        },
    })),

    on(
        ChapterActions.deleteChapterSuccess,
        (state, { subjectId, chapterId }) => ({
            ...state,
            chaptersBySubject: {
                ...state.chaptersBySubject,
                [subjectId]:
                    state.chaptersBySubject[subjectId]?.filter(
                        (c) => c.id !== chapterId
                    ) || [],
            },
        })
    )
);
