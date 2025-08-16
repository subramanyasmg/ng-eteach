import { createReducer, on } from '@ngrx/store';
import * as PublisherActions from './publishers.actions';
import { IPublisher } from 'app/models/publisher.types';

export interface PublisherState {
  publishers: IPublisher[];
  loaded: boolean;
  error: any;
}

export const initialState: PublisherState = {
  publishers: [],
  loaded: false,
  error: null,
};

export const publisherReducer = createReducer(
  initialState,
  on(PublisherActions.loadPublishers, state => ({ ...state, loaded: false, error: null })),
  on(PublisherActions.loadPublishersSuccess, (state, { publishers }) => ({
    ...state,
    publishers,
    loaded: true,
    error: null,
  })),
  on(PublisherActions.loadPublishersFailure, (state, { error }) => ({ ...state, error, loaded: false })),
  on(PublisherActions.addPublisherSuccess, (state, { publisher }) => ({
    ...state,
    publishers: [...state.publishers, publisher],
  })),
  on(PublisherActions.updatePublisherSuccess, (state, { publisher }) => ({
    ...state,
    publishers: state.publishers.map(c => c.id === publisher.id ? publisher : c),
  })),
  on(PublisherActions.deletePublisherSuccess, (state, { id }) => ({
    ...state,
    publishers: state.publishers.filter(c => c.id !== id),
  }))
);
