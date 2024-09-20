import { Injectable, Signal, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  Subject,
  catchError,
  filter,
  map,
  merge,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { Fight } from '../../../shared/interfaces/fight';
import { toSignal } from '@angular/core/rxjs-interop';
import { RandomEncounterService } from './random-encounter.service';
export interface FightState {
  fight: Signal<Fight | undefined>;
  status: Signal<'completed' | 'loading' | 'error' | undefined>;
  error: Signal<string | undefined>;
}
@Injectable()
export class FightService {
  private _randomEncounterService = inject(RandomEncounterService);
  private baseUrl = environment.url + '/fights';
  private http = inject(HttpClient);
  private error$ = new Subject<Error>();
  fightStart$ = new Subject<{ damage: number; armor: number }>();

  private onFightStart$ = this.fightStart$.pipe(
    switchMap(({ damage, armor }) => this.simulateFight(damage, armor)),
    shareReplay(1)
  );
  private status$ = merge(
    this.fightStart$.pipe(map(() => 'loading' as const)),
    this.onFightStart$.pipe(
      filter((fight) => fight !== undefined),
      map(() => 'completed' as const)
    ),
    this._randomEncounterService.loadRandomEncounter$.pipe(
      map(() => undefined)
    ),
    this.error$.pipe(map(() => 'error' as const))
  );
  private fight = toSignal(this.onFightStart$, { initialValue: undefined });
  private status = toSignal(this.status$, { initialValue: undefined });
  private error = toSignal(this.error$.pipe(map((err) => err.message)), {
    initialValue: undefined,
  });
  private simulateFight(weaponDamage: number, armor: number) {
    return this.http.post<Fight>(this.baseUrl, { weaponDamage, armor }).pipe(
      catchError((err: HttpErrorResponse) => {
        this.error$.next(err.error);
        return of(undefined);
      })
    );
  }
  state: FightState = {
    fight: this.fight,
    status: this.status,
    error: this.error,
  };
}
