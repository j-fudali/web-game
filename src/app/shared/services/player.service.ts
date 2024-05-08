import { Injectable, computed, inject, signal } from '@angular/core';
import { PlayerCharacter } from '../interfaces/player-character';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  map,
  merge,
  of,
  shareReplay,
  tap,
  throwError,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private http = inject(HttpClient);
  private baseUrl = environment.url + '/player-character';
  private _playerCharacter$ = new BehaviorSubject<PlayerCharacter | undefined>(
    undefined
  );
  private fetchedPlayerCharacter$ = this.http
    .get<PlayerCharacter>(this.baseUrl)
    .pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status == 404) {
          return of(undefined);
        }
        return throwError(() => err);
      })
    );
  combinedPlayerCharacter$ = combineLatest([
    this._playerCharacter$,
    this.fetchedPlayerCharacter$,
  ]).pipe(map(([s1, s2]) => s1 || s2));
  readonly playerCharacter = toSignal<PlayerCharacter | undefined>(
    this.combinedPlayerCharacter$,
    {
      initialValue: undefined,
    }
  );
  setPlayerCharacter(playerCharacter: PlayerCharacter) {
    this._playerCharacter$.next(playerCharacter);
  }
  constructor() {}
}
