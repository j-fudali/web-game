import { Injectable, Signal, inject } from '@angular/core';
import { PlayerCharacter } from '../interfaces/player-character';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Observable,
  Subject,
  catchError,
  concatMap,
  endWith,
  filter,
  forkJoin,
  interval,
  map,
  merge,
  of,
  shareReplay,
  switchMap,
  takeUntil,
  tap,
  throwError,
  withLatestFrom,
} from 'rxjs';
import { OwnedItem } from '../interfaces/owned-item';
import { CreateCharacter } from '../../features/game/interfaces/create-character';
import { MessageService } from 'primeng/api';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import {
  dealDamage,
  reduceEnergyByTen,
  restoreEnergy,
  restoreHealth,
} from '../utils/functions';
import { ThirdwebService } from './thirdweb.service';
import { RestData } from '../interfaces/rest-data';
export type PlayerCharacterStatus =
  | 'completed'
  | 'loading'
  | 'empty'
  | 'resting'
  | 'rested';
export interface PlayerCharacterState {
  playerCharacter: Signal<PlayerCharacter | null | undefined>;
  status: Signal<PlayerCharacterStatus>;
}

@Injectable()
export class PlayerCharacterService {
  private http = inject(HttpClient);
  private baseUrl = environment.url + '/player-character';
  private _messageService = inject(MessageService);
  private _thirdwebService = inject(ThirdwebService);
  private router = inject(Router);
  createCharacter$ = new Subject<CreateCharacter>();
  equipItem$ = new Subject<OwnedItem>();
  unequipItem$ = new Subject<OwnedItem>();
  dealDamageToPlayerCharacter$ = new Subject<number>();
  restoreHealth$ = new Subject<number>();
  restoreEnergy$ = new Subject<number>();
  reduceEnergyByTen$ = new Subject<void>();
  rest$ = new Subject<void>();
  stopRest$ = new Subject<void>();
  private fetchedPlayerCharacter$ = this.http
    .get<PlayerCharacter>(this.baseUrl)
    .pipe(
      map(pc => ({
        ...pc,
        equippedItems: pc.equippedItems.map(i => BigInt(i)),
      })),
      catchError((err: HttpErrorResponse) => {
        if (err.status == 404) {
          return of(null);
        }
        return throwError(() => err);
      }),
      shareReplay(1)
    );
  private onCreateCharacter$ = this.createCharacter$.pipe(
    switchMap(({ name, image, characterClassId, equippedItems }) => {
      const formdata = new FormData();
      formdata.set('name', name);
      formdata.set('image', image);
      formdata.set('characterClassId', characterClassId);
      formdata.set('equippedItems[]', equippedItems[0]);
      return forkJoin([
        this.http.post<PlayerCharacter>(this.baseUrl, formdata).pipe(
          catchError(err => {
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
        this._thirdwebService
          .claimStartingWeapon(BigInt(equippedItems[0]))
          .pipe(
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
    map(item => ({
      ...this.state.playerCharacter()!,
      equippedItems: [...this.playerCharacter()!.equippedItems, item.tokenId],
    }))
  );
  private onUnequip$: Observable<PlayerCharacter> = this.unequipItem$.pipe(
    map(item => ({
      ...this.state.playerCharacter()!,
      equippedItems: this.state
        .playerCharacter()!
        .equippedItems.filter(i => i != item.tokenId),
    }))
  );
  private onDealDamage$: Observable<PlayerCharacter> =
    this.dealDamageToPlayerCharacter$.pipe(
      map(
        damage => dealDamage(this.playerCharacter()!, damage) as PlayerCharacter
      ),
      shareReplay(1)
    );
  private onRestoreHealth$: Observable<PlayerCharacter> =
    this.restoreHealth$.pipe(
      map(
        health =>
          restoreHealth(this.playerCharacter()!, health) as PlayerCharacter
      ),
      shareReplay(1)
    );
  private onReduceEnergyByTen$: Observable<PlayerCharacter> =
    this.reduceEnergyByTen$.pipe(
      map(() => reduceEnergyByTen(this.playerCharacter()!)),
      shareReplay(1)
    );
  private onRestoreEnergy$: Observable<PlayerCharacter> =
    this.restoreEnergy$.pipe(
      map(energy => restoreEnergy(this.playerCharacter()!, energy)),
      shareReplay(1)
    );
  private playerCharacter$ = merge(
    this.onCreateCharacter$,
    this.fetchedPlayerCharacter$,
    this.onEquip$,
    this.onUnequip$,
    this.onDealDamage$,
    this.onRestoreHealth$,
    this.onRestoreEnergy$,
    this.onReduceEnergyByTen$
  );
  stopCondtionTriggers$ = merge(
    this.playerCharacter$.pipe(
      filter(
        pc =>
          pc?.statistics.energy.actualValue ===
          pc?.statistics.energy.maximumValue
      ),
      filter(
        pc =>
          pc?.statistics.health.actualValue ===
          pc?.statistics.health.maximumValue
      )
    ),
    this.stopRest$,
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      filter(event => {
        const url = (event as NavigationEnd).urlAfterRedirects;
        return url == '/game/play' || url == '/marketplace';
      })
    )

    // fromEvent(window, 'beforeunload')
  );
  // private initialRest$ = this.http.get<RestData>(this.baseUrl + '/rest').pipe(
  //   tap(console.log),
  //   tap(({startingTime, healthPerSecond}) => {
  //     const timeDiff = Math.ceil((Date.now() - Date.parse(startingTime)) / 1000)
  //     const restoredHealth = timeDiff * healthPerSecond
  //     console.log(restoredHealth)
  //     this.restoreHealth$.next(restoredHealth)
  //     if(this.playerCharacter()!.statistics.health.actualValue < this.playerCharacter()!.statistics.health.maximumValue){
  //       this.rest$.next()
  //     }
  //   }),
  //   catchError((err: HttpErrorResponse) => of(undefined))
  // );
  private onRest$: Observable<'resting' | 'rested'> = this.rest$.pipe(
    switchMap(() =>
      this.http
        .post<RestData>(this.baseUrl + '/rest', {})
        .pipe(catchError((err: HttpErrorResponse) => of(undefined)))
    ),
    filter(res => res !== undefined),
    concatMap(restData =>
      interval(1000).pipe(
        tap(() => {
          this.restoreHealth$.next((restData as RestData).healthPerSecond);
          this.restoreEnergy$.next((restData as RestData).energyPerSecond);
        }),
        map(() => 'resting' as const),
        takeUntil(this.stopCondtionTriggers$),
        endWith('rested' as const)
      )
    ),
    shareReplay(1)
  );
  private onStopRest$ = this.stopCondtionTriggers$.pipe(
    withLatestFrom(this.onRest$),
    filter(([_, state]) => state === 'resting'),
    switchMap(() => this.http.delete(this.baseUrl + '/rest/stop')),
    tap(() =>
      this._messageService.add({
        detail: 'Zakończono odpoczynek',
        severity: 'info',
      })
    )
  );
  private status$: Observable<PlayerCharacterStatus> = merge(
    merge(this.equipItem$, this.createCharacter$).pipe(
      map(() => 'loading' as const)
    ),
    this.fetchedPlayerCharacter$.pipe(map(pc => (pc ? 'completed' : 'empty'))),
    this.rest$.pipe(map(() => 'resting' as const)),
    this.onRest$,
    this.onStopRest$.pipe(map(() => 'completed' as const))
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
