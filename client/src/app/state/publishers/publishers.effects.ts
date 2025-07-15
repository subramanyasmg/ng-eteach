import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import * as PublisherActions from './publishers.actions';
import { PublisherService } from 'app/services/publishers.service';

@Injectable()
export class PublisherEffects {
  constructor(private actions$: Actions, private service: PublisherService) {}

  loadPublishers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PublisherActions.loadPublishers),
      mergeMap(() =>
        this.service.getAll().pipe(
          map(response => PublisherActions.loadPublishersSuccess({ publishers: response.publishers })),
          catchError(error => of(PublisherActions.loadPublishersFailure({ error })))
        )
      )
    )
  );

  addPublisher$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PublisherActions.addPublisher),
      mergeMap(({ publisher }) =>
        this.service.create(publisher).pipe(
          map(response => PublisherActions.addPublisherSuccess({ publisher: response.data })),
          catchError(error => of(PublisherActions.addPublisherFailure({ error })))
        )
      )
    )
  );

  updatePublisher$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PublisherActions.updatePublisher),
      mergeMap(({ publisher }) =>
        this.service.update(publisher.id,publisher).pipe(
          map(response => PublisherActions.updatePublisherSuccess({ publisher: response })),
          catchError(error => of(PublisherActions.updatePublisherFailure({ error })))
        )
      )
    )
  );

  deletePublisher$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PublisherActions.deletePublisher),
      mergeMap(({ id }) =>
        this.service.delete(id).pipe(
          map(() => PublisherActions.deletePublisherSuccess({ id })),
          catchError(error => of(PublisherActions.deletePublisherFailure({ error })))
        )
      )
    )
  );
}
