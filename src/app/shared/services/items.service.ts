import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { getOwnedNFTs } from 'thirdweb/extensions/erc1155';
import { startingWeapons } from '../constants/thirdweb.constants';
import { WalletDataService } from './wallet-data.service';
import {
  Observable,
  Subject,
  catchError,
  debounceTime,
  filter,
  from,
  map,
  merge,
  of,
  scan,
  shareReplay,
  startWith,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { convertNftToItem } from '../utils/functions';
import { OwnedItem } from '../interfaces/owned-item';
import { PlayerService } from './player.service';
import { PlayerCharacter } from '../interfaces/player-character';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ItemsState {
  avaliableItems: Signal<OwnedItem[]>;
  equippedItems: Signal<OwnedItem[]>;
  status: Signal<'completed' | 'loading'>;
  equipmentSaveStatus: Signal<{ status: 'saved' | 'notSaved' } | undefined>;
}

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  private http = inject(HttpClient);
  private _walletDataService = inject(WalletDataService);
  private _playerService = inject(PlayerService);
  private fetchOwnedItems$ = toObservable(
    this._walletDataService.state.data
  ).pipe(
    switchMap((wallet) => {
      if (wallet)
        return from(
          getOwnedNFTs({
            contract: startingWeapons,
            address: this._walletDataService.state.data()!.account.address,
          })
        ).pipe(
          map((nfts) =>
            nfts.map((nft) => ({
              tokenId: nft.id,
              quantity: nft.quantityOwned,
              ...nft.metadata,
            }))
          ),
          map((nfts) =>
            nfts.map(
              (nft) =>
                ({
                  quantity: nft.quantity,
                  ...convertNftToItem(nft),
                } as OwnedItem)
            )
          )
        );
      return of([]);
    }),
    shareReplay(1)
  );

  private status$ = this.fetchOwnedItems$.pipe(
    filter((items) => items.length > 0),
    map((items) => (items ? 'completed' : 'loading'))
  );

  private status = toSignal(this.status$, {
    initialValue: 'loading',
  });
  private ownedItems = toSignal<OwnedItem[], OwnedItem[]>(
    this.fetchOwnedItems$,
    {
      initialValue: [],
    }
  );
  private equippedItems = computed(() =>
    this.ownedItems().filter((item) =>
      this._playerService.state
        .playerCharacter()
        ?.equippedItems.includes(item.tokenId)
    )
  );
  private availableItems = computed(() => {
    return this.ownedItems().filter(
      (item) =>
        !this._playerService.state
          .playerCharacter()
          ?.equippedItems.includes(item.tokenId)
    );
  });

  //Saving equipment state
  private setEquippedItems = (items: bigint[]) =>
    this.http.put<Pick<PlayerCharacter, 'equippedItems'>>(
      environment.url + '/player-character/equipped-items',
      {
        equippedItems: items.map((i) => i.toString()),
      }
    );
  private equipmentSaveStatus$: Observable<{ status: 'saved' | 'notSaved' }> =
    merge(
      this._playerService.equipItem$,
      this._playerService.unequipItem$
    ).pipe(
      debounceTime(3000),
      switchMap(() =>
        this.setEquippedItems(this.equippedItems().map((i) => i.tokenId))
      ),
      map(() => ({ status: 'saved' } as { status: 'saved' | 'notSaved' })),
      catchError(() =>
        of({
          status: 'notSaved',
        } as { status: 'saved' | 'notSaved' })
      )
    );
  private equipmentSaveStatus = toSignal(this.equipmentSaveStatus$, {
    initialValue: undefined,
  });
  state: ItemsState = {
    avaliableItems: this.availableItems,
    equippedItems: this.equippedItems,
    status: this.status,
    equipmentSaveStatus: this.equipmentSaveStatus,
  };
}
