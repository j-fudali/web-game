import { Injectable, Signal, inject } from '@angular/core';
import {
  EncounterOnDraw,
  EnemyEncounter,
} from '../../../shared/interfaces/encounter';

import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { PlayerCharacterService } from '../../../shared/services/player-character.service';
import { Enemy } from '../../../shared/interfaces/enemy';
import { dealDamage } from '../../../shared/utils/functions';
import { Effect } from '../../../shared/interfaces/effect';
import { SelectDecision } from '../interfaces/select-decision';
import { DialogService } from 'primeng/dynamicdialog';
import { EffectDisplayDialogComponent } from '../components/effect-display-dialog/effect-display-dialog.component';
import { PlayerCharacter } from '../../../shared/interfaces/player-character';
import { WalletService } from '../../../shared/services/wallet.service';
import {
  Subject,
  switchMap,
  filter,
  tap,
  shareReplay,
  map,
  EMPTY,
  of,
  concatMap,
  merge,
  catchError,
  combineLatest,
  take,
} from 'rxjs';
import { EncounterApiService } from '../../../shared/api/encounters/encounter-api.service';
export interface EncountersState {
  enemy: Signal<Enemy | undefined>;
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
  private onDealDamageToEnemy$ = this.dealDamageToEnemy$.pipe(
    map(damage => {
      return dealDamage(this.state.enemy()!, damage) as Enemy;
    })
  );
  private onLoadRandomEncounter$ = this.loadRandomEncounter$.pipe(
    concatMap(() =>
      combineLatest([this.pcStatus$, this.pc$]).pipe(
        filter(([status, pc]) => status === 'completed' && !!pc),
        map(([status, pc]) => pc as PlayerCharacter),
        take(1)
      )
    ),
    concatMap(pc =>
      !this._playerCharacterService.checkIfRestIsNeed() ? of(pc) : EMPTY
    ),
    concatMap(({ level }) =>
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
  private enemy$ = merge(
    this.onLoadRandomEncounter$.pipe(
      map(encounter => encounter as EnemyEncounter),
      map(encounter => encounter.enemy)
    ),
    this.onDealDamageToEnemy$
  );

  private status$ = merge(
    this.loadRandomEncounter$.pipe(map(() => 'loading' as const)),
    merge(this.onLoadRandomEncounter$, this.onDecisionSelect$).pipe(
      filter(res => res !== undefined),
      map(() => 'completed' as const)
    ),
    this.error$.pipe(map(() => 'error' as const))
  );
  private randomEncounter = toSignal(this.onLoadRandomEncounter$, {
    initialValue: undefined,
  });
  private enemy = toSignal(this.enemy$, { initialValue: undefined });
  private status = toSignal(this.status$, { initialValue: 'loading' });
  private error = toSignal(this.error$.pipe(map(err => err.message)), {
    initialValue: undefined,
  });
  private effect = toSignal(this.onDecisionSelect$, {
    initialValue: undefined,
  });
  state: EncountersState = {
    enemy: this.enemy,
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
