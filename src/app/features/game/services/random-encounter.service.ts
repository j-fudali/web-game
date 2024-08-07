import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable, Signal, inject } from '@angular/core';
import {
  EncounterOnDraw,
  EnemyEncounter,
  EnemyEncounterDto,
} from '../../../shared/interfaces/encounter';
import {
  Subject,
  catchError,
  combineLatest,
  filter,
  lastValueFrom,
  map,
  merge,
  of,
  shareReplay,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs';
import { environment } from '../../../../environments/environment';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { PlayerCharacterService } from '../../../shared/services/player-character.service';
import { Statistics } from '../../../shared/interfaces/statistics';
import { Enemy } from '../../../shared/interfaces/enemy';
import { dealDamage } from '../../../shared/utils/functions';

export interface EncountersState {
  randomEncounter: Signal<EncounterOnDraw | undefined>;
  status: Signal<'completed' | 'loading' | 'error'>;
  error: Signal<string | undefined>;
}

@Injectable({
  providedIn: 'root',
})
export class RandomEncounterService {
  private _playerCharacterService = inject(PlayerCharacterService);
  private http = inject(HttpClient);
  private readonly baseUrl = environment.url + '/encounters/random';
  dealDamageToEnemy$ = new Subject<number>();
  loadRandomEncounter$ = new Subject<void>();
  private error$ = new Subject<Error>();
  private onLoadRandomEncounter$ = combineLatest([
    this.loadRandomEncounter$,
    toObservable(this._playerCharacterService.state.playerCharacter).pipe(
      filter((pc) => pc !== undefined),
      take(1)
    ),
  ]).pipe(
    map(([_, pc]) => pc),
    switchMap((pc) => this.loadRandomEncounter(pc!.level)),
    shareReplay(1)
  );
  private randomEncounter$ = merge(
    this.onLoadRandomEncounter$,
    this.dealDamageToEnemy$.pipe(
      map((damage) => {
        const enemyEncounter = this.randomEncounter() as EnemyEncounter;
        return {
          ...enemyEncounter,
          enemy: dealDamage(enemyEncounter.enemy, damage),
        } as EncounterOnDraw;
      })
    )
  );
  private status$ = merge(
    this.loadRandomEncounter$.pipe(map(() => 'loading' as const)),
    this.onLoadRandomEncounter$.pipe(
      filter((encounter) => encounter !== undefined),
      map(() => 'completed' as const)
    ),
    this.error$.pipe(map(() => 'error' as const))
  );
  private randomEncounter = toSignal(this.randomEncounter$, {
    initialValue: undefined,
  });
  private status = toSignal(this.status$, { initialValue: 'loading' });
  private error = toSignal(this.error$.pipe(map((err) => err.message)), {
    initialValue: undefined,
  });
  state: EncountersState = {
    randomEncounter: this.randomEncounter,
    status: this.status,
    error: this.error,
  };
  private loadRandomEncounter(level: number) {
    return this.http
      .get<EncounterOnDraw>(this.baseUrl, {
        params: new HttpParams().set('difficulty', level),
      })
      .pipe(
        map((encounter) => {
          const enemyEncounter = encounter as EnemyEncounterDto;
          if (enemyEncounter.enemy === undefined) return encounter;
          const statistics: Statistics = {
            health: {
              actualValue: enemyEncounter.enemy.maxHealth,
              maximumValue: enemyEncounter.enemy.maxHealth,
            },
            powerPoints: {
              actualValue: enemyEncounter.enemy.maxPowerPoints,
              maximumValue: enemyEncounter.enemy.maxPowerPoints,
            },
            energy: { actualValue: 0, maximumValue: 0 },
          };
          const enemy: Enemy = { ...enemyEncounter.enemy, statistics };
          return {
            ...enemyEncounter,
            enemy,
          };
        }),
        catchError((err: HttpErrorResponse) => {
          this.error$.next(err.error);
          return of(undefined);
        })
      );
  }
}
