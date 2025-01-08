import { Injectable, inject } from '@angular/core';
import { ThirdwebService } from '../../../shared/thirdweb/thirdweb.service';
import {
  Observable,
  Subject,
  combineLatest,
  map,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { MarketplaceItem } from '../interfaces/marketplace-item';
import { SellData } from '../interfaces/sell-data';
import { ItemsService } from '../../../shared/services/items.service';
import { MarketplaceItemMapper } from '../util/marketplace-item.mapper';
import { TransactionReceipt } from 'thirdweb/dist/types/transaction/types';
import { OwnedItem } from 'app/shared/interfaces/owned-item';
import { GetWalletBalanceResult } from 'thirdweb/dist/types/wallets/utils/getWalletBalance';
import { LoaderService } from 'app/shared/features/loader/loader.service';

@Injectable()
export class MarketplaceService {
  private loaderService = inject(LoaderService);
  private _itemsService = inject(ItemsService);
  private _thirdwebService = inject(ThirdwebService);
  refreshItems$ = new Subject<void>();
  getAllItems$ = this.refreshItems$.pipe(
    startWith(undefined),
    tap(() => this.loaderService.show()),
    switchMap(() =>
      combineLatest([
        this._itemsService.getOwnedItems$(),
        this._thirdwebService
          .getListings()
          .pipe(
            map(listings =>
              listings.map(listing =>
                MarketplaceItemMapper.mapListingToMarketplaceItem(listing)
              )
            )
          ),
      ])
    ),
    tap(() => this.loaderService.hide()),
    shareReplay(1)
  );
  getWalletBalance$(): Observable<GetWalletBalanceResult> {
    return this._thirdwebService.getBalance();
  }
  getAccountAddress$(): Observable<string> {
    return this._thirdwebService.getAccount$().pipe(map(acc => acc.address));
  }
  getOwnedItems$(): Observable<OwnedItem[]> {
    return this.getAllItems$.pipe(map(([ownedItems]) => ownedItems));
  }
  buy$(item: MarketplaceItem): Observable<TransactionReceipt> {
    return this._thirdwebService
      .buyFromListing(item)
      .pipe(tap(() => this.refreshItems$.next()));
  }
  sell$(sellData: SellData): Observable<TransactionReceipt> {
    return this._thirdwebService
      .createListing(sellData)
      .pipe(tap(() => this.refreshItems$.next()));
  }
  getMarketplaceItems$(): Observable<MarketplaceItem[]> {
    return this.getAllItems$.pipe(map(([, listings]) => listings));
  }
}
