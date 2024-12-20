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
} from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { WalletService } from '../../../../shared/services/wallet.service';

@Injectable()
export class BuyLootboxesService {
  private thirdwebService = inject(ThirdwebService);
  private walletService = inject(WalletService);
  private account$ = toObservable(this.walletService.state.account);
  buyLootbox$ = new Subject<{ listingId: bigint; price: bigint }>();

  private onBuyLootbox$ = combineLatest([
    this.buyLootbox$,
    this.account$.pipe(filter(acc => !!acc)),
  ]).pipe(
    switchMap(([{ listingId, price }, acc]) =>
      this.thirdwebService.buyPack(acc, listingId, price).pipe(
        catchError(err => {
          console.log(err);
          return of(undefined);
        }),
        shareReplay(1)
      )
    )
  );
  private lootboxes$ = this.thirdwebService.getPacks().pipe(
    catchError(() => of(undefined)),
    shareReplay(1)
  );
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
  lootbox = toSignal(
    this.lootboxes$.pipe(map(res => (res ? res[0] : undefined))),
    { initialValue: undefined }
  );
}
