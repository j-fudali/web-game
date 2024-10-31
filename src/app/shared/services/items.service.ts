import { Injectable, Signal, inject } from '@angular/core';
import { Observable, filter, map, shareReplay } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { OwnedItem } from '../interfaces/owned-item';
import { ThirdwebService } from './thirdweb.service';
import { ItemMapper } from '../utils/item-mapper';
import { NFT } from 'thirdweb';

export interface ItemsState {
  onwedItems: Signal<OwnedItem[]>;
  status: Signal<'completed' | 'loading'>;
}

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  private _thirdwebService = inject(ThirdwebService);
  private fetchOwnedItems$: Observable<OwnedItem[]> = this._thirdwebService
    .getOwnedItems()
    .pipe(
      filter(res => res !== undefined),
      map(nfts => nfts as (NFT & { quantityOwned: bigint })[]),
      map(nfts =>
        nfts.map(({ quantityOwned, ...nft }) => {
          const item = ItemMapper.convertNftToItem(nft);
          return ItemMapper.convertItemToOwnedItem(item, quantityOwned);
        })
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
