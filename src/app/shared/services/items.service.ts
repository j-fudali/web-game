import { Injectable, inject } from '@angular/core';
import {
  Observable,
  filter,
  map,
  take,
  forkJoin,
  concat,
  combineLatest,
  tap,
} from 'rxjs';
import { OwnedItem } from '../interfaces/owned-item';
import { ThirdwebService } from '../thirdweb/thirdweb.service';
import { ItemMapper } from '../utils/item-mapper';
import { NFT } from 'thirdweb';

@Injectable({
  providedIn: 'root',
})
export class ItemsService {
  private _thirdwebService = inject(ThirdwebService);

  getOwnedItems$(): Observable<OwnedItem[]> {
    return this._thirdwebService.getOwnedItems().pipe(
      map(items => items as (NFT & { quantityOwned: bigint })[]),
      map(nfts =>
        nfts.map(({ quantityOwned, ...nft }) => {
          const item = ItemMapper.convertNftToItem(nft);
          return ItemMapper.convertItemToOwnedItem(item, quantityOwned);
        })
      )
    );
  }
}
