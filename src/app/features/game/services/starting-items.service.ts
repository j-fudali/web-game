import { Injectable, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, from, map, merge, shareReplay } from 'rxjs';
import { claimTo, getNFTs } from 'thirdweb/extensions/erc1155';
import { Item } from '../../../shared/interfaces/item';
import { convertNftToItem } from '../../../shared/utils/functions';
import { sendTransaction } from 'thirdweb';
import { ThirdwebService } from '../../../shared/services/thirdweb.service';

export interface StartingItemsState {
  items: Signal<Item[]>;
  status: Signal<'loaded' | 'loading' | 'error'>;
}
export interface Trait {
  trait_type: 'classType' | 'damage' | 'armor' | 'type' | 'bodySlot';
  value: string;
}
export type Attributes = Omit<Item, 'name' | 'image'>;
@Injectable({
  providedIn: 'root',
})
export class StartingItemsService {
  private _thirdwebService = inject(ThirdwebService)
  private error$ = new Subject<string>();
  private startingItems$ = this._thirdwebService.getStartingItems().pipe(
    map((nfts) =>
      nfts.filter((nft) => [BigInt(0), BigInt(1), BigInt(2)].includes(nft.id))
    ),
    map((nfts) => nfts.map((nft) => ({ tokenId: nft.id, ...nft.metadata }))),
    map((nfts) => nfts.map((nft) => convertNftToItem(nft))),
    shareReplay(1)
  );
  private status$ = merge(
    this.startingItems$.pipe(map((items) => (items ? 'loaded' : 'loading'))),
    this.error$.pipe(map(() => 'error' as const))
  );
  private startingItems = toSignal(this.startingItems$, { initialValue: [] });
  private status = toSignal(this.status$, { initialValue: 'loading' });
  public state: StartingItemsState = {
    items: this.startingItems,
    status: this.status,
  };
}
