import { inject, Injectable } from '@angular/core';
import { EnemiesApiService } from '../../../../../../shared/api/enemies/enemies-api.service';
import {
  catchError,
  filter,
  map,
  merge,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable()
export class EnemiesListService {
  private enemiesApiService = inject(EnemiesApiService);
  private error$ = new Subject<Error>();
  getEnemies$ = new Subject<number>();
  private enemiesResponse$ = this.getEnemies$.pipe(
    startWith(0),
    switchMap(page =>
      this.enemiesApiService.getEnemies(page).pipe(
        catchError(err => {
          this.error$.next(err);
          return of(undefined);
        })
      )
    ),
    shareReplay(1)
  );
  private status$ = merge(
    this.enemiesResponse$
      .pipe(
        filter(res => res !== undefined),
        map(() => 'completed' as const)
      )
      .pipe(startWith('loading' as const)),
    this.error$.pipe(map(() => 'error' as const))
  );
  enemies = toSignal(
    this.enemiesResponse$.pipe(
      filter(res => !!res),
      map(res => res?.content)
    ),
    {
      initialValue: [],
    }
  );
  page = toSignal(
    this.enemiesResponse$.pipe(
      filter(res => !!res),
      map(res => res?.number)
    )
  );
  pageSize = toSignal(
    this.enemiesResponse$.pipe(
      filter(res => !!res),
      map(res => res?.pageable.pageSize)
    )
  );
  totalElements = toSignal(
    this.enemiesResponse$.pipe(
      filter(res => !!res),
      map(res => res?.totalElements)
    )
  );
  status = toSignal(this.status$, {
    initialValue: 'loading',
  });
}
