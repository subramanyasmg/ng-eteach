import { createAction, props } from '@ngrx/store';
import { IPublisher } from 'app/models/publisher.types';

export const loadPublishers = createAction('[Publisher] Load Publishers');
export const loadPublishersSuccess = createAction('[Publisher] Load Publishers Success', props<{ publishers: IPublisher[] }>());
export const loadPublishersFailure = createAction('[Publisher] Load Publishers Failure', props<{ error: any }>());

export const addPublisher = createAction('[Publisher] Add Publisher', props<{ publisher: IPublisher }>());
export const addPublisherSuccess = createAction('[Publisher] Add Publisher Success', props<{ publisher: IPublisher }>());
export const addPublisherFailure = createAction('[Publisher] Add Publisher Failure', props<{ error: any }>());

export const updatePublisher = createAction('[Publisher] Update Publisher', props<{ publisher: IPublisher }>());
export const updatePublisherSuccess = createAction('[Publisher] Update Publisher Success', props<{ publisher: IPublisher }>());
export const updatePublisherFailure = createAction('[Publisher] Update Publisher Failure', props<{ error: any }>());

export const deletePublisher = createAction('[Publisher] Delete Publisher', props<{ id: number }>());
export const deletePublisherSuccess = createAction('[Publisher] Delete Publisher Success', props<{ id: number }>());
export const deletePublisherFailure = createAction('[Publisher] Delete Publisher Failure', props<{ error: any }>());
