import { createReducer, on } from '@ngrx/store';
import { ICurriculum } from 'app/models/curriculum.types';
import * as CurriculumActions from './curriculum.actions';

export interface CurriculumState {
    curriculums: { [publisherId: string]: ICurriculum[] };
    loaded: boolean;
    error: any;
}

export const initialState: CurriculumState = {
    curriculums: {},
    loaded: false,
    error: null,
};

export const curriculumReducer = createReducer(
    initialState,
    on(CurriculumActions.loadCurriculums, (state) => ({
        ...state,
        loaded: false,
        error: null,
    })),
    on(
        CurriculumActions.loadCurriculumsSuccess,
        (state, { publisherId, curriculums }) => ({
            ...state,
            curriculums: {
                ...state.curriculums,
                [publisherId]: curriculums,
            },
            loaded: true,
            error: null,
        })
    ),
    on(CurriculumActions.loadCurriculumsFailure, (state, { error }) => ({
        ...state,
        error,
        loaded: false,
    })),
    on(
        CurriculumActions.addCurriculumSuccess,
        (state, { publisherId, curriculum }) => ({
            ...state,
            curriculums: {
                ...state.curriculums,
                [publisherId]: [
                    ...(state.curriculums[publisherId] || []),
                    curriculum,
                ],
            },
        })
    ),
    on(
        CurriculumActions.updateCurriculumSuccess,
        (state, { publisherId, curriculum }) => ({
            ...state,
            curriculums: {
                ...state.curriculums,
                [publisherId]:
                    state.curriculums[publisherId]?.map((c) =>
                        c.id === curriculum.id ? curriculum : c
                    ) || [],
            },
        })
    ),
    on(
        CurriculumActions.deleteCurriculumSuccess,
        (state, { publisherId, curriculumId }) => ({
            ...state,
            curriculums: {
                ...state.curriculums,
                [curriculumId]:
                    state.curriculums[publisherId]?.filter(
                        (c) => c.id !== curriculumId
                    ) || [],
            },
        })
    )
);
