import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Subject,
  startWith,
  switchMap,
  catchError,
  of,
  shareReplay,
  map,
  tap,
  scan,
  merge,
  filter,
} from 'rxjs';
import { EnemiesApiService } from '../../../../../../shared/api/enemies/enemies-api.service';
import { EnemyDto } from '../../../../../../shared/api/enemies/model/enemy.dto';
import { EnemiesDto } from 'app/shared/api/enemies/model/enemies.dto';

@Injectable()
export class EncounterFormService {
  private enemiesApiService = inject(EnemiesApiService);

  getEnemies$ = new Subject<number>();
  private enemies$ = this.getEnemies$.pipe(
    startWith(1),
    switchMap(page =>
      this.enemiesApiService
        .getEnemies(page)
        .pipe(catchError(() => of(undefined)))
    ),
    shareReplay(1)
  );
  private status$ = merge(
    this.getEnemies$.pipe(map(() => 'loadings')),
    this.enemies$.pipe(
      filter(res => !!res),
      map(() => 'completed')
    )
  );
  enemies = toSignal(
    this.enemies$.pipe(
      map(res => res?.content),
      scan((acc, val) => (!!val ? [...acc, ...val] : acc), [] as EnemiesDto[])
    ),
    {
      initialValue: [],
    }
  );
  last = toSignal(this.enemies$.pipe(map(res => res?.last)), {
    initialValue: false,
  });
  page = toSignal(
    this.enemies$.pipe(map(res => (res ? res.pageable.pageNumber + 1 : 1))),
    {
      initialValue: 1,
    }
  );
  status = toSignal(this.status$, {
    initialValue: 'loading',
  });
}
