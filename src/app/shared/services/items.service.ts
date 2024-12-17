import { Injectable, Signal, inject } from '@angular/core';
import {
  Observable,
  Subject,
  filter,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { OwnedItem } from '../interfaces/owned-item';
import { ThirdwebService } from '../thirdweb/thirdweb.service';
import { ItemMapper } from '../utils/item-mapper';
import { NFT } from 'thirdweb';
import { WalletService } from './wallet.service';

export interface ItemsState {
  onwedItems: Signal<OwnedItem[]>;
  status: Signal<'completed' | 'loading'>;
}

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  private _thirdwebService = inject(ThirdwebService);
  private _walletService = inject(WalletService);
  getOwnedItems$ = new Subject<void>();
  private fetchOwnedItems$: Observable<OwnedItem[]> = this.getOwnedItems$.pipe(
    switchMap(() =>
      this._thirdwebService
        .getOwnedItems(this._walletService.state.account())
        .pipe(
          filter(res => res !== undefined),
          map(nfts => nfts as (NFT & { quantityOwned: bigint })[]),
          map(nfts =>
            nfts.map(({ quantityOwned, ...nft }) => {
              const item = ItemMapper.convertNftToItem(nft);
              return ItemMapper.convertItemToOwnedItem(item, quantityOwned);
            })
          )
        )
    ),
    shareReplay(1)
  );

  private status$ = this.fetchOwnedItems$.pipe(
    map(items => (items ? 'completed' : 'loading'))
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
  state: ItemsState = {
    onwedItems: this.ownedItems,
    status: this.status,
  };
}
