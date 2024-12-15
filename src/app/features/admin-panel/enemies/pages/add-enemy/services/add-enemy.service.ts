import { inject, Injectable, Signal } from '@angular/core';
import { EnemiesApiService } from '../../../../../../shared/api/enemies/enemies-api.service';
import {
  catchError,
  filter,
  map,
  merge,
  of,
  shareReplay,
  Subject,
  switchMap,
} from 'rxjs';
import { NewEnemyDto } from '../../../../../../shared/api/enemies/model/new-enemy.dto';
import { toSignal } from '@angular/core/rxjs-interop';

export interface AddEnemyState {
  status: Signal<'success' | 'loading' | 'error' | null>;
}

@Injectable()
export class AddEnemyService {
  private enemiesApiService = inject(EnemiesApiService);

  addEnemy$ = new Subject<NewEnemyDto>();
  private error$ = new Subject<Error>();
  private onAddEnemy$ = this.addEnemy$.pipe(
    switchMap(enemy =>
      this.enemiesApiService.createEnemy(enemy).pipe(
        catchError(err => {
          this.error$.next(err);
          return of(undefined);
        })
      )
    ),
    shareReplay(1)
  );

  private status$ = merge(
    this.addEnemy$.pipe(map(() => 'loading' as const)),
    this.onAddEnemy$.pipe(
      filter(res => res !== undefined),
      map(() => 'success' as const)
    ),
    this.error$.pipe(map(() => 'error' as const))
  );

  private status = toSignal(this.status$, { initialValue: null });
  state: AddEnemyState = {
    status: this.status,
  };
}
