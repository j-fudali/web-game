import { Injectable, Signal, inject } from '@angular/core';
import { Subject, filter, map, merge, shareReplay, switchMap } from 'rxjs';
import { Fight } from '../../../shared/interfaces/fight';
import { toSignal } from '@angular/core/rxjs-interop';
import { RandomEncounterService } from './random-encounter.service';
import { FightApiService } from '../../../shared/api/fight/fight-api.service';
export interface FightState {
  fight: Signal<Fight | undefined>;
  status: Signal<'completed' | 'loading' | 'error' | undefined>;
  error: Signal<string | undefined>;
}
@Injectable()
export class FightService {
  private _randomEncounterService = inject(RandomEncounterService);
  private fightApiService = inject(FightApiService);
  private error$ = new Subject<Error>();
  fightStart$ = new Subject<{ damage: number; armor: number }>();

  private onFightStart$ = this.fightStart$.pipe(
    switchMap(({ damage, armor }) =>
      this.fightApiService.simulateFight(damage, armor)
    ),
    shareReplay(1)
  );
  private status$ = merge(
    this.fightStart$.pipe(map(() => 'loading' as const)),
    this.onFightStart$.pipe(
      filter(fight => fight !== undefined),
      map(() => 'completed' as const)
    ),
    this._randomEncounterService.loadRandomEncounter$.pipe(
      map(() => undefined)
    ),
    this.error$.pipe(map(() => 'error' as const))
  );
  private fight = toSignal(this.onFightStart$, { initialValue: undefined });
  private status = toSignal(this.status$, { initialValue: undefined });
  private error = toSignal(this.error$.pipe(map(err => err.message)), {
    initialValue: undefined,
  });

  state: FightState = {
    fight: this.fight,
    status: this.status,
    error: this.error,
  };
}
