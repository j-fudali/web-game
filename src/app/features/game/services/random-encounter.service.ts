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
import { Router } from '@angular/router';
import { GetRestDialogComponent } from '../components/get-rest-dialog/get-rest-dialog.component';
import { PlayerCharacter } from '../../../shared/interfaces/player-character';
import { WalletService } from '../../../shared/services/wallet.service';
import {
  Subject,
  switchMap,
  filter,
  tap,
  shareReplay,
  withLatestFrom,
  map,
  EMPTY,
  of,
  concatMap,
  merge,
  catchError,
  combineLatest,
  iif,
  Observable,
  startWith,
  combineLatestWith,
  skip,
  skipUntil,
  skipWhile,
  take,
} from 'rxjs';
import { EncounterApiService } from '../../../shared/api/encounters/encounter-api.service';
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
  private _encountersApiService = inject(EncounterApiService);
  private _walletService = inject(WalletService);
  private dialog = inject(DialogService);
  dealDamageToEnemy$ = new Subject<number>();
  loadRandomEncounter$ = new Subject<void>();
  selectDecision$ = new Subject<SelectDecision>();
  private pcStatus$ = toObservable(this._playerCharacterService.state.status);
  private pc$ = toObservable(
    this._playerCharacterService.state.playerCharacter
  );
  private error$ = new Subject<Error>();
  private onDecisionSelect$ = this.selectDecision$.pipe(
    switchMap(({ encounterId, decision }) =>
      this._encountersApiService.selectDecision(encounterId, decision).pipe(
        catchError(err => {
          this.error$.next(err);
          return of(undefined);
        })
      )
    ),
    filter(effect => effect !== undefined),
    tap(effect => this.resolveEffect(effect as Effect)),
    tap(effect => {
      const ref = this.dialog.open(EffectDisplayDialogComponent, {
        data: {
          effect,
          transactionStatus: this._walletService.state.status,
        },
        closable: false,
        header: 'Efekt',
      });
      if (ref)
        ref.onClose.subscribe((nextEncounter: boolean) => {
          if (nextEncounter) this.loadRandomEncounter$.next();
        });
    }),
    shareReplay(1)
  );

  private onLoadRandomEncounter$ = this.loadRandomEncounter$.pipe(
    concatMap(() =>
      combineLatest([this.pcStatus$, this.pc$]).pipe(
        filter(([status, pc]) => status === 'completed' && !!pc),
        map(([status, pc]) => pc as PlayerCharacter),
        take(1)
      )
    ),
    switchMap(pc =>
      !this._playerCharacterService.checkIfRestIsNeed() ? of(pc) : EMPTY
    ),
    switchMap(({ level }) =>
      this._encountersApiService.loadRandomEncounter(level).pipe(
        catchError(err => {
          this.error$.next(err);
          return of(undefined);
        })
      )
    ),
    tap(() => this._playerCharacterService.reduceEnergyByTen$.next()),
    shareReplay(1)
  );
  private randomEncounter$ = merge(
    this.onLoadRandomEncounter$,
    this.dealDamageToEnemy$.pipe(
      map(damage => {
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
      filter(res => res !== undefined),
      map(() => 'completed' as const)
    ),
    this.error$.pipe(map(() => 'error' as const))
  );
  private randomEncounter = toSignal(this.randomEncounter$, {
    initialValue: undefined,
  });
  private status = toSignal(this.status$, { initialValue: 'loading' });
  private error = toSignal(this.error$.pipe(map(err => err.message)), {
    initialValue: undefined,
  });
  private effect = toSignal(this.onDecisionSelect$, {
    initialValue: undefined,
  });
  state: EncountersState = {
    randomEncounter: this.randomEncounter,
    effect: this.effect,
    status: this.status,
    error: this.error,
  };
  private resolveEffect(effect: Effect) {
    if (effect.goldAmount) {
      if (effect.goldAmount === 0) return;
      if (effect.goldAmount > 0) {
        this._walletService.gainGearcoins$.next(effect.goldAmount);
      }
    }
    if (effect.healthAmount) {
      if (effect.healthAmount >= 0) {
        this._playerCharacterService.restoreHealth$.next(effect.healthAmount);
      } else {
        this._playerCharacterService.dealDamageToPlayerCharacter$.next(
          effect.healthAmount * -1
        );
      }
    }
  }
}
