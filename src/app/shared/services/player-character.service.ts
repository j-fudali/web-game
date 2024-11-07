import { Injectable, Signal, inject } from '@angular/core';
import { PlayerCharacter } from '../interfaces/player-character';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  Observable,
  Subject,
  concatMap,
  endWith,
  filter,
  forkJoin,
  interval,
  map,
  merge,
  shareReplay,
  switchMap,
  takeUntil,
  tap,
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
import { AuthService } from './auth.service';
import { PlayerCharacterApiService } from '../api/player-character/player-character-api.service';
import { WalletService } from './wallet.service';
import { GetRestDialogComponent } from '../../features/game/components/get-rest-dialog/get-rest-dialog.component';
import { DialogService } from 'primeng/dynamicdialog';
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

@Injectable({ providedIn: 'root' })
export class PlayerCharacterService {
  private dialog = inject(DialogService);
  private _playerCharacterApiService = inject(PlayerCharacterApiService);
  private _messageService = inject(MessageService);
  private _thirdwebService = inject(ThirdwebService);
  private _walletService = inject(WalletService);
  private _authService = inject(AuthService);
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
  private fetchedPlayerCharacter$ = toObservable(
    this._authService.state.isLogged
  ).pipe(
    filter(isLogged => isLogged === true),
    switchMap(() => this._playerCharacterApiService.getPlayerCharacter()),
    filter(res => res !== undefined),
    map(
      pc =>
        ({
          ...pc,
          equippedItems: (pc as PlayerCharacter).equippedItems.map(i =>
            BigInt(i)
          ),
        } as PlayerCharacter)
    ),
    shareReplay(1)
  );
  private onCreateCharacter$ = this.createCharacter$.pipe(
    switchMap(newCharacter =>
      forkJoin([
        this._playerCharacterApiService.createCharacter(newCharacter),
        this._thirdwebService.claimStartingWeapon(
          this._walletService.state.account(),
          BigInt(newCharacter.equippedItems[0])
        ),
      ])
    ),
    filter(([pc, itemClaim]) => pc !== null && itemClaim !== null),
    tap(() => {
      this.router.navigate(['/game']);
      this._messageService.add({
        summary: 'Utworzono!',
        detail: 'Postać została utworzona',
        severity: 'success',
      });
    }),
    map(([character, _]) => character),
    shareReplay(1)
  );
  private onEquip$: Observable<PlayerCharacter> = this.equipItem$.pipe(
    map(item => ({
      ...this.state.playerCharacter()!,
      equippedItems: [...this.playerCharacter()!.equippedItems, item.tokenId],
    })),
    shareReplay(1)
  );
  private onUnequip$: Observable<PlayerCharacter> = this.unequipItem$.pipe(
    map(item => ({
      ...this.state.playerCharacter()!,
      equippedItems: this.state
        .playerCharacter()!
        .equippedItems.filter(i => i != item.tokenId),
    })),
    shareReplay(1)
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
  playerCharacter$ = merge(
    this.onCreateCharacter$,
    this.fetchedPlayerCharacter$,
    this.onEquip$,
    this.onUnequip$,
    this.onDealDamage$,
    this.onRestoreHealth$,
    this.onRestoreEnergy$,
    this.onReduceEnergyByTen$
  );
  private stopCondtionTriggers$ = merge(
    this.playerCharacter$.pipe(
      filter(
        pc =>
          pc?.statistics?.energy.actualValue ===
          pc?.statistics?.energy.maximumValue
      ),
      filter(
        pc =>
          pc?.statistics?.health.actualValue ===
          pc?.statistics?.health.maximumValue
      )
    ),
    this.stopRest$,
    this.router.events.pipe(filter(event => event instanceof NavigationEnd))
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
    concatMap(() => this._playerCharacterApiService.rest()),
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
  private onStopRest$ = this.onRest$.pipe(
    filter(state => state === 'rested'),
    switchMap(() => this._playerCharacterApiService.stopRest()),
    filter(res => res !== undefined),
    tap(() =>
      this._messageService.add({
        detail: 'Zakończono odpoczynek',
        severity: 'info',
      })
    ),
    shareReplay(1)
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
  checkIfRestIsNeed(): boolean {
    const pc = this.playerCharacter()!;
    if (
      pc.statistics.health.actualValue === 0 ||
      pc.statistics.energy.actualValue - 10 < 0
    ) {
      this.router.navigate(['/game']);
      const ref = this.dialog.open(GetRestDialogComponent, {
        header: 'Odpoczynek',
      });
      ref.onClose.subscribe(rest => {
        if (rest) this.rest$.next();
      });
      return true;
    }
    return false;
  }
}
