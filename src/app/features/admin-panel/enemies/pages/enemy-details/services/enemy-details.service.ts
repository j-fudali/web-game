import { inject, Injectable } from '@angular/core';
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
  tap,
} from 'rxjs';
import { UpdateEnemyDto } from '../../../../../../shared/api/enemies/model/update-enemy.dto';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

@Injectable()
export class EnemyDetailsService {
  private enemiesApiService = inject(EnemiesApiService);
  private router = inject(Router);
  private error$ = new Subject<Error>();
  getEnemy$ = new Subject<string>();
  updateEnemy$ = new Subject<{ id: string; data: UpdateEnemyDto }>();
  deleteEnemy$ = new Subject<string>();
  private onGetEnemy$ = this.getEnemy$.pipe(
    switchMap(id =>
      this.enemiesApiService.getEnemyById(id).pipe(
        catchError(err => {
          this.error$.next(err);
          return of(undefined);
        })
      )
    ),
    shareReplay(1)
  );
  private onUpdateEnemy$ = this.updateEnemy$.pipe(
    switchMap(({ id, data }) =>
      this.enemiesApiService.updateEnemy(id, data).pipe(
        catchError(err => {
          this.error$.next(err);
          return of(undefined);
        })
      )
    )
  );
  private onDeleteEnemy$ = this.deleteEnemy$.pipe(
    switchMap(id =>
      this.enemiesApiService.deleteEnemy(id).pipe(
        tap(() => this.router.navigate(['../'])),
        catchError(err => {
          this.error$.next(err);
          return of(undefined);
        })
      )
    )
  );
  private status$ = merge(
    this.getEnemy$.pipe(map(() => 'loading' as const)),
    this.updateEnemy$.pipe(map(() => 'update-loading' as const)),
    this.onGetEnemy$.pipe(
      filter(res => res !== undefined),
      map(() => 'completed' as const)
    ),
    this.onUpdateEnemy$.pipe(
      filter(res => res !== undefined),
      map(() => 'update-success' as const)
    ),
    this.deleteEnemy$.pipe(map(() => 'delete-loading' as const)),
    this.onDeleteEnemy$.pipe(
      filter(res => res !== undefined),
      map(() => 'delete-success' as const)
    ),
    this.error$.pipe(map(() => 'error' as const))
  );
  enemy = toSignal(this.onGetEnemy$, { initialValue: undefined });
  status = toSignal(this.status$, { initialValue: null });
}
