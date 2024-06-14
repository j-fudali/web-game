import { Injectable, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject, from, map, merge, shareReplay, tap } from 'rxjs';
import { claimTo, getNFT, getNFTs } from 'thirdweb/extensions/erc1155';
import {
  metamask,
  startingWeapons,
} from '../../../shared/constants/thirdweb.constants';
import { Item } from '../../../shared/interfaces/item';
import { convertIpfs, convertNftToItem } from '../../../shared/utils/functions';
import { WalletDataService } from '../../../shared/services/wallet-data.service';
import { sendTransaction } from 'thirdweb';

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
  private _walletDataService = inject(WalletDataService);
  private error$ = new Subject<string>();
  private startingItems$ = from(getNFTs({ contract: startingWeapons })).pipe(
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

  claimItem(tokenId: bigint) {
    const account = this._walletDataService.state.data()!.account;
    return from(
      sendTransaction({
        transaction: claimTo({
          contract: startingWeapons,
          to: account?.address,
          tokenId,
          quantity: 1n,
        }),
        account,
      })
    );
  }
}
