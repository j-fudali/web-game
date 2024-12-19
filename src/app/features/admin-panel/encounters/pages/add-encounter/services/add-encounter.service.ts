import { inject, Injectable } from '@angular/core';
import { EncounterApiService } from '../../../../../../shared/api/encounters/encounter-api.service';
import {
  catchError,
  filter,
  map,
  merge,
  of,
  scan,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { NewEncounterDto } from '../../../../../../shared/api/encounters/model/new-encounter.dto';
import { toSignal } from '@angular/core/rxjs-interop';
import { EnemiesApiService } from '../../../../../../shared/api/enemies/enemies-api.service';
import { EnemyDto } from '../../../../../../shared/api/enemies/model/enemy.dto';

@Injectable()
export class AddEncounterService {
  private encountersApiService = inject(EncounterApiService);
  private enemiesApiService = inject(EnemiesApiService);
  private error$ = new Subject<Error>();
  createEncounter$ = new Subject<NewEncounterDto>();
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
  private onCreateEncouter$ = this.createEncounter$.pipe(
    switchMap(data =>
      this.encountersApiService.createEncounters(data).pipe(
        catchError(err => {
          this.error$.next(err);
          return of(undefined);
        })
      )
    ),
    shareReplay(1)
  );
  private status$ = merge(
    this.getEnemies$.pipe(map(() => 'enemies-loading' as const)),
    this.enemies$.pipe(
      filter(res => !!res),
      map(() => 'enemies-completed' as const)
    ),
    this.createEncounter$.pipe(map(() => 'loading' as const)),
    this.onCreateEncouter$.pipe(
      filter(res => res !== undefined),
      map(() => 'success' as const)
    ),
    this.error$.pipe(map(() => 'error' as const))
  );
  enemies = toSignal(
    this.enemies$.pipe(
      map(res => res?.content),
      tap(console.log),
      scan((acc, val) => (!!val ? [...acc, ...val] : acc), [] as EnemyDto[])
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
  status = toSignal(this.status$, { initialValue: null });
}
