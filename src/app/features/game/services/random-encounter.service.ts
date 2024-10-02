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
  EMPTY,
  Subject,
  catchError,
  combineLatest,
  concatMap,
  exhaustMap,
  filter,
  map,
  merge,
  mergeMap,
  of,
  retry,
  shareReplay,
  skipUntil,
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
import { dealDamage, reduceEnergyByTen } from '../../../shared/utils/functions';
import { Effect } from '../../../shared/interfaces/effect';
import { SelectDecision } from '../interfaces/select-decision';
import { DialogService } from 'primeng/dynamicdialog';
import { EffectDisplayDialogComponent } from '../components/effect-display-dialog/effect-display-dialog.component';
import { Router } from '@angular/router';
import { GetRestDialogComponent } from '../components/get-rest-dialog/get-rest-dialog.component';
import { PlayerCharacter } from '../../../shared/interfaces/player-character';
import { ThirdwebService } from '../../../shared/services/thirdweb.service';
export interface EncountersState {
  randomEncounter: Signal<EncounterOnDraw | undefined>;
  effect: Signal<Effect | undefined>;
  status: Signal<'completed' | 'loading' | 'effect-loaded' | 'error'>;
  error: Signal<string | undefined>;
}

@Injectable({
  providedIn: 'root',
})
export class RandomEncounterService {
  private _playerCharacterService = inject(PlayerCharacterService);
  private _thirdwebService = inject(ThirdwebService);
  private http = inject(HttpClient);
  private dialog = inject(DialogService)
  private router = inject(Router)
  private readonly baseUrl = environment.url + '/encounters';
  dealDamageToEnemy$ = new Subject<number>();
  loadRandomEncounter$ = new Subject<void>();
  selectDecision$ = new Subject<SelectDecision>()
  private error$ = new Subject<Error>();

  private onDecisionSelect$ = this.selectDecision$.pipe(
    switchMap(({encounterId, decision}) => this.selectDecision(encounterId, decision)),
    filter((effect) => effect !== undefined),
    tap((effect) => this.resolveEffect(effect as Effect)),
    tap((effect) => {
      const ref = this.dialog.open(EffectDisplayDialogComponent, {
        data: {
          effect,
          transactionStatus: this._thirdwebService.state.status
        },
        closable: false,
        header: 'Efekt'
      })
      if(ref)
        ref.onClose.subscribe((nextEncounter: boolean) => {
          if(nextEncounter) this.loadRandomEncounter$.next()
        })
    }), 
    shareReplay(1)
  )
  private onLoadRandomEncounter$ = this.loadRandomEncounter$.pipe(
    withLatestFrom(toObservable(this._playerCharacterService.state.status)),
    filter(([_, status]) => status === 'completed'),
    withLatestFrom(
      toObservable(this._playerCharacterService.state.playerCharacter),
    ),
    filter(([_, pc]) => pc !== undefined && pc !== null),
    concatMap(([_, pc]) => {
      if((pc as PlayerCharacter).statistics.health.actualValue === 0 || 
        (pc as PlayerCharacter).statistics.energy.actualValue - 10 < 0){
        this.router.navigate(['/'])
        const ref = this.dialog.open(GetRestDialogComponent, {
          header: 'Odpoczynek'
        })
        ref.onClose.subscribe((rest) => {
          if(rest) this._playerCharacterService.rest$.next()
        })
        return EMPTY;
      }
      return of(pc);
    }),
    tap(() => this._playerCharacterService.reduceEnergyByTen$.next()),
    concatMap((pc) => this.loadRandomEncounter(pc!.level)),
    shareReplay(1)
  );
  private randomEncounter$ = merge(
    this.onLoadRandomEncounter$,
    this.dealDamageToEnemy$.pipe(
      map((damage) => {
        const enemyEncounter = this.randomEncounter() as EnemyEncounter;
        return {
          ...enemyEncounter,
          enemy: dealDamage(enemyEncounter.enemy, damage) as Enemy,
        } as EncounterOnDraw;
      })
    )
  );
  private status$ = merge(
    this.loadRandomEncounter$.pipe(map(() => 'loading' as const)),
    merge(this.onLoadRandomEncounter$, this.onDecisionSelect$).pipe(
      filter((res) => res !== undefined),
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
  private effect = toSignal(this.onDecisionSelect$, { initialValue: undefined})
  state: EncountersState = {
    randomEncounter: this.randomEncounter,
    effect: this.effect,
    status: this.status,
    error: this.error,
  };
  private loadRandomEncounter(level: number) {
    return this.http
      .get<EncounterOnDraw>(this.baseUrl + '/random', {
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
  private selectDecision(encounterId: string, decision: string) {
    return this.http.post<Effect>(
      `${this.baseUrl}/${encounterId}/select-decision`,
      {
        decisionText: decision,
      }
    ).pipe(
        catchError((err: HttpErrorResponse) => {
          this.error$.next(err);
          return of(undefined)
        })
    )
  }
  private resolveEffect(effect: Effect){
    if(effect.goldAmount){
      if(effect.goldAmount === 0) return;
      if(effect.goldAmount > 0){
        this._thirdwebService.gainGearcoins$.next(effect.goldAmount)
      }
    }
    if(effect.healthAmount){
      if(effect.healthAmount >= 0){
        this._playerCharacterService.restoreHealth$.next(effect.healthAmount)
      }
      else{
        this._playerCharacterService.dealDamageToPlayerCharacter$.next(effect.healthAmount * (-1))
      }
    }
  }
}
