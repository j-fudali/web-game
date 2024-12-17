import { Injectable, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, filter, map, merge, shareReplay } from 'rxjs';
import { Item } from '../../../shared/interfaces/item';
import { ThirdwebService } from '../../../shared/thirdweb/thirdweb.service';
import { ItemMapper } from '../../../shared/utils/item-mapper';
import { NFT } from 'thirdweb';

export interface StartingItemsState {
  items: Signal<Item[]>;
  status: Signal<'loaded' | 'loading' | 'error'>;
}
export interface Trait {
  trait_type: 'classType' | 'damage' | 'armor' | 'type' | 'bodySlot';
  value: unknown;
}
export type Attributes = Omit<Item, 'name' | 'image'>;
@Injectable({
  providedIn: 'root',
})
export class StartingItemsService {
  private _thirdwebService = inject(ThirdwebService);
  private error$ = new Subject<string>();
  private startingItems$ = this._thirdwebService.getStartingItems().pipe(
    filter(res => res !== undefined),
    map(nfts => nfts as NFT[]),
    map(nfts =>
      nfts.filter(nft => [BigInt(0), BigInt(1), BigInt(2)].includes(nft.id))
    ),
    map(nfts => nfts.map(nft => ItemMapper.convertNftToItem(nft))),
    shareReplay(1)
  );
  private status$ = merge(
    this.startingItems$.pipe(map(items => (items ? 'loaded' : 'loading'))),
    this.error$.pipe(map(() => 'error' as const))
  );
  private startingItems = toSignal(this.startingItems$, { initialValue: [] });
  private status = toSignal(this.status$, { initialValue: 'loading' });
  public state: StartingItemsState = {
    items: this.startingItems,
    status: this.status,
  };
}
