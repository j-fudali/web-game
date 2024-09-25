import { Injectable, Signal, inject } from '@angular/core';
import {
  filter,
  map,
  of,
  shareReplay,
  switchMap,
} from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { convertNftToItem } from '../utils/functions';
import { OwnedItem } from '../interfaces/owned-item';
import { ThirdwebService } from './thirdweb.service';

export interface ItemsState {
  onwedItems: Signal<OwnedItem[]>
  status: Signal<'completed' | 'loading'>;
}

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  private _thirdwebService = inject(ThirdwebService)

  // buy$;
  // sell$;


  private fetchOwnedItems$ = toObservable(
    this._thirdwebService.state.data
  ).pipe(
    switchMap((wallet) => {
      if (wallet)
        return this._thirdwebService.getOwnedItems().pipe(
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
  state: ItemsState = {
    onwedItems: this.ownedItems,
    status: this.status,
  };
}
