import { Injectable, Signal, inject } from '@angular/core';
import { PlayerCharacter } from '../interfaces/player-character';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  Observable,
  Subject,
  catchError,
  combineLatest,
  debounce,
  debounceTime,
  map,
  merge,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError,
  withLatestFrom,
} from 'rxjs';
import { OwnedItem } from '../interfaces/owned-item';
import { ItemsService } from './items.service';

export interface PlayerCharacterState {
  playerCharacter: Signal<PlayerCharacter | undefined>;
  status: Signal<'completed' | 'loading' | 'empty'>;
}

@Injectable({
  providedIn: 'root',
})
export class PlayerService {
  private http = inject(HttpClient);
  private baseUrl = environment.url + '/player-character';
  private fetchedPlayerCharacter$ = this.http
    .get<PlayerCharacter>(this.baseUrl)
    .pipe(
      map((pc) => ({
        ...pc,
        equippedItems: pc.equippedItems.map((i) => BigInt(i)),
      })),
      catchError((err: HttpErrorResponse) => {
        if (err.status == 404) {
          return of(undefined);
        }
        return throwError(() => err);
      })
    );

  setOnSignUp$ = new Subject<PlayerCharacter>();
  equipItem$ = new Subject<OwnedItem>();
  unequipItem$ = new Subject<OwnedItem>();

  private onEquip$: Observable<PlayerCharacter> = this.equipItem$.pipe(
    map((item) => ({
      ...this.state.playerCharacter()!,
      equippedItems: [...this.playerCharacter()!.equippedItems, item.tokenId],
    }))
  );
  private onUnequip$: Observable<PlayerCharacter> = this.unequipItem$.pipe(
    map((item) => ({
      ...this.state.playerCharacter()!,
      equippedItems: this.state
        .playerCharacter()!
        .equippedItems.filter((i) => i != item.tokenId),
    }))
  );
  playerCharacter$ = merge(
    this.setOnSignUp$,
    this.fetchedPlayerCharacter$,
    this.onEquip$,
    this.onUnequip$
  ).pipe(shareReplay(1));
  private status$ = merge(
    this.equipItem$.pipe(map(() => 'loading' as const)),
    this.playerCharacter$.pipe(map((pc) => (pc ? 'completed' : 'empty')))
  );

  private playerCharacter = toSignal<PlayerCharacter | undefined>(
    this.playerCharacter$,
    {
      initialValue: undefined,
    }
  );
  private status = toSignal(this.status$, { initialValue: 'loading' });

  state: PlayerCharacterState = {
    playerCharacter: this.playerCharacter,
    status: this.status,
  };
}
