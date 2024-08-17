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
  map,
  merge,
  of,
  shareReplay,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { environment } from '../../../../environments/environment';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { PlayerCharacterService } from '../../../shared/services/player-character.service';
import { Statistics } from '../../../shared/interfaces/statistics';
import { Enemy } from '../../../shared/interfaces/enemy';
import { dealDamage } from '../../../shared/utils/functions';
import { Effect } from '../../../shared/interfaces/effect';
import { SelectDecision } from '../interfaces/select-decision';
import { DialogService } from 'primeng/dynamicdialog';
import { EffectDisplayDialogComponent } from '../components/effect-display-dialog/effect-display-dialog.component';
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
  private http = inject(HttpClient);
  private dialog = inject(DialogService)
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
          effect
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
      //Thirdweb
      //Claim Gearcoin
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
