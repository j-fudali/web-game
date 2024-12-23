import { inject, Injectable } from '@angular/core';
import { ThirdwebService } from '../../../../shared/thirdweb/thirdweb.service';
import {
  catchError,
  filter,
  map,
  of,
  shareReplay,
  Subject,
  switchMap,
  combineLatest,
  merge,
  tap,
  startWith,
} from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { WalletService } from '../../../../shared/services/wallet.service';
import { DirectListing } from 'thirdweb/extensions/marketplace';

@Injectable()
export class BuyLootboxesService {
  private thirdwebService = inject(ThirdwebService);
  private walletService = inject(WalletService);
  private account$ = toObservable(this.walletService.state.account);
  buyLootbox$ = new Subject<DirectListing>();
  getLootboxes$ = new Subject<number>();
  private onBuyLootbox$ = combineLatest([
    this.buyLootbox$,
    this.account$.pipe(filter(acc => !!acc)),
  ]).pipe(
    switchMap(([listing, acc]) =>
      this.thirdwebService
        .buyPack(acc, listing.id, listing.currencyValuePerToken.value)
        .pipe(
          catchError(err => {
            console.log(err);
            return of(undefined);
          }),
          shareReplay(1)
        )
    )
  );
  private lootboxes$ = this.getLootboxes$.pipe(
    startWith(0),
    switchMap(page =>
      this.thirdwebService.getPacks(page).pipe(catchError(() => of(undefined)))
    ),
    shareReplay(1)
  );
  private totalRecords$ = this.thirdwebService
    .getTotalPacksListings()
    .pipe(shareReplay(1));

  status = toSignal(
    merge(
      this.lootboxes$.pipe(
        filter(res => !!res),
        map(() => 'completed')
      ),
      this.buyLootbox$.pipe(map(() => 'buy-loading')),
      this.onBuyLootbox$.pipe(
        filter(res => !!res),
        map(() => 'buy-cmpleted')
      )
    ),
    { initialValue: 'loading' }
  );
  lootboxes = toSignal(this.lootboxes$, { initialValue: [] });
  totalRecords = toSignal(this.totalRecords$, { initialValue: undefined });
}
