import { Injectable, Signal, inject } from '@angular/core';
import { ThirdwebService } from '../../../shared/thirdweb/thirdweb.service';
import {
  Subject,
  catchError,
  filter,
  map,
  merge,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { MarketplaceItem } from '../interfaces/marketplace-item';
import { SellData } from '../interfaces/sell-data';
import { MessageService } from 'primeng/api';
import { ItemMapper } from '../../../shared/utils/item-mapper';
import { DirectListing } from 'thirdweb/extensions/marketplace';
import { ItemsService } from '../../../shared/services/items.service';
import { WalletService } from '../../../shared/services/wallet.service';

export interface MarketplaceState {
  items: Signal<MarketplaceItem[]>;
  status: Signal<'completed' | 'loading' | 'sold' | 'bought' | 'error' | null>;
}

@Injectable({ providedIn: 'root' })
export class MarketplaceService {
  private _itemsService = inject(ItemsService);
  private _thirdwebService = inject(ThirdwebService);
  private _walletService = inject(WalletService);
  private _messageService = inject(MessageService);
  getListings$ = new Subject<void>();
  sell$ = new Subject<SellData>();
  buy$ = new Subject<MarketplaceItem>();
  private error$ = new Subject<Error>();
  private onSell$ = this.sell$.pipe(
    switchMap(sellData =>
      this._thirdwebService
        .createListing(this._walletService.state.account(), sellData)
        .pipe(
          catchError(err => {
            this.error$.next(err);
            return of(undefined);
          })
        )
    ),
    filter(res => res !== undefined),
    tap(() => this._itemsService.getOwnedItems$.next()),
    tap(() =>
      this._messageService.add({
        severity: 'success',
        summary: 'Sukces',
        detail: 'Przedmiot został wystawiony na sprzedaż',
      })
    ),
    shareReplay(1)
  );
  private onBuy$ = this.buy$.pipe(
    switchMap(item =>
      this._thirdwebService
        .buyFromListing(this._walletService.state.account(), item)
        .pipe(
          tap(() => this._walletService.loseGearcoins$.next()),
          catchError(err => {
            this.error$.next(err);
            return of(undefined);
          })
        )
    ),
    filter(res => res !== undefined),
    tap(() => this._itemsService.getOwnedItems$.next()),
    tap(() =>
      this._messageService.add({
        severity: 'success',
        summary: 'Sukces',
        detail: 'Udało się kupić przedmiot',
      })
    ),
    shareReplay(1)
  );
  private listings$ = merge(this.getListings$, this.onSell$, this.onBuy$).pipe(
    switchMap(() => this._thirdwebService.getListings()),
    filter(res => res !== undefined),
    map(listings => listings as DirectListing[]),
    map(listings =>
      listings.map(
        listing =>
          ({
            listingId: listing.id,
            balance: listing.currencyValuePerToken,
            creatorAddress: listing.creatorAddress,
            ...ItemMapper.convertNftToItem(listing.asset),
          } as MarketplaceItem)
      )
    ),
    shareReplay(1)
  );
  private status$ = merge(
    merge(this.getListings$, this.sell$, this.buy$).pipe(
      map(() => 'loading' as const)
    ),
    merge(this.listings$, this.onBuy$, this.onSell$).pipe(
      map(() => 'completed' as const)
    ),
    this.error$.pipe(map(() => 'error' as const))
  );
  private items = toSignal(this.listings$, {
    initialValue: [] as MarketplaceItem[],
  });
  private status = toSignal(this.status$, { initialValue: 'loading' });
  public state: MarketplaceState = {
    items: this.items,
    status: this.status,
  };
}
