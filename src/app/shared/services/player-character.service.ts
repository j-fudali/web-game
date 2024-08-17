import { Injectable, Signal, inject } from '@angular/core';
import { PlayerCharacter } from '../interfaces/player-character';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Observable,
  Subject,
  catchError,
  forkJoin,
  map,
  merge,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { OwnedItem } from '../interfaces/owned-item';
import { CreateCharacter } from '../../features/game/interfaces/create-character';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { dealDamage, restoreHealth } from '../utils/functions';
import { ThirdwebService } from './thirdweb.service';

export interface PlayerCharacterState {
  playerCharacter: Signal<PlayerCharacter | null | undefined>;
  status: Signal<'completed' | 'loading' | 'empty'>;
}

@Injectable({
  providedIn: 'root',
})
export class PlayerCharacterService {
  private http = inject(HttpClient);
  private baseUrl = environment.url + '/player-character';
  private _messageService = inject(MessageService);
  private _thirdwebService = inject(ThirdwebService)
  private router = inject(Router);
  private fetchedPlayerCharacter$ = this.http
    .get<PlayerCharacter>(this.baseUrl)
    .pipe(
      map((pc) => ({
        ...pc,
        equippedItems: pc.equippedItems.map((i) => BigInt(i)),
      })),
      catchError((err: HttpErrorResponse) => {
        if (err.status == 404) {
          return of(null);
        }
        return throwError(() => err);
      }),
      shareReplay(1)
    );

  createCharacter$ = new Subject<CreateCharacter>();
  equipItem$ = new Subject<OwnedItem>();
  unequipItem$ = new Subject<OwnedItem>();
  dealDamageToPlayerCharacter$ = new Subject<number>();
  restoreHealth$ = new Subject<number>()
  private onCreateCharacter$ = this.createCharacter$.pipe(
    switchMap(({ name, image, characterClassId, equippedItems }) => {
      const formdata = new FormData();
      formdata.set('name', name);
      formdata.set('image', image);
      formdata.set('characterClassId', characterClassId);
      formdata.set('equippedItems[]', equippedItems[0]);
      return forkJoin([
        this.http.post<PlayerCharacter>(this.baseUrl, formdata).pipe(
          catchError((err) => {
            if (err.status == 409) {
              this._messageService.add({
                summary: 'Błąd',
                severity: 'error',
                detail: 'Posiadasz już postać',
              });
            } else {
              this._messageService.add({
                summary: 'Błąd',
                detail: 'Nie można utworzyć postaci',
                severity: 'error',
              });
            }
            return of(undefined);
          })
        ),
        this._thirdwebService.claimStartingWeapon(BigInt(equippedItems[0])).pipe(
          catchError(() => {
            return of(null);
          })
        ),
      ]).pipe(
        tap(() => {
          this.router.navigate(['/game']);
          this._messageService.add({
            summary: 'Utworzono!',
            detail: 'Postać została utworzona',
            severity: 'success',
          });
        })
      );
    }),
    map(([character, transaction]) => character),
    shareReplay(1)
  );
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
  private onDealDamage$: Observable<PlayerCharacter> =
    this.dealDamageToPlayerCharacter$.pipe(
      map((damage) => {
        const pc = this.playerCharacter()!;
        return { ...pc, ...dealDamage(pc, damage) };
      })
    );
  private onRestoreHealth$: Observable<PlayerCharacter> = 
  this.restoreHealth$.pipe(
    map((health) => {
      const pc = this.playerCharacter()!;
      return {...pc, ...restoreHealth(pc, health)}
    })
  )
  private playerCharacter$ = merge(
    this.onCreateCharacter$,
    this.fetchedPlayerCharacter$,
    this.onEquip$,
    this.onUnequip$,
    this.onDealDamage$,
    this.onRestoreHealth$
  );
  private status$ = merge(
    merge(this.equipItem$, this.createCharacter$).pipe(
      map(() => 'loading' as const)
    ),
    this.playerCharacter$.pipe(map((pc) => (pc ? 'completed' : 'empty')))
  );

  private playerCharacter = toSignal<PlayerCharacter | null | undefined>(
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
