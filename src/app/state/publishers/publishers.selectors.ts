import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PublisherState } from './publishers.reducer';

export const selectPublisherState = createFeatureSelector<PublisherState>('publisher');

export const selectAllPublishers = createSelector(
  selectPublisherState,
  (state) => state.publishers
);

export const selectPublishersLoaded = createSelector(
  selectPublisherState,
  (state) => state.loaded
);
