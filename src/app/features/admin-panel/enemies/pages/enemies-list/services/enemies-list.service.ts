import { inject, Injectable } from '@angular/core';
import { EnemiesApiService } from '../../../../../../shared/api/enemies/enemies-api.service';
import {
  catchError,
  filter,
  finalize,
  map,
  merge,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { LoaderService } from 'app/shared/features/loader/loader.service';

@Injectable()
export class EnemiesListService {
  private loaderService = inject(LoaderService);
  private enemiesApiService = inject(EnemiesApiService);
  private error$ = new Subject<Error>();
  getEnemies$ = new Subject<number>();
  private enemiesResponse$ = this.getEnemies$.pipe(
    startWith(0),
    tap(() => this.loaderService.show()),
    switchMap(page =>
      this.enemiesApiService.getEnemies(page).pipe(
        catchError(err => {
          this.error$.next(err);
          return of(undefined);
        }),
        finalize(() => this.loaderService.hide())
      )
    ),
    shareReplay(1)
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
}
