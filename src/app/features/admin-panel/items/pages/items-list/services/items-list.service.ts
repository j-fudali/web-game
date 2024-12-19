import { inject, Injectable, signal } from '@angular/core';
import { ThirdwebService } from '../../../../../../shared/thirdweb/thirdweb.service';
import {
  catchError,
  combineLatest,
  filter,
  map,
  merge,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ItemMapper } from '../../../../../../shared/utils/item-mapper';
import { NFT } from 'thirdweb';
import { WalletService } from '../../../../../../shared/services/wallet.service';

@Injectable()
export class ItemsListService {
  private thirdwebService = inject(ThirdwebService);
  private walletService = inject(WalletService);
  private account$ = toObservable(this.walletService.state.account);
  getItems$ = new Subject<number>();

  private items$ = this.getItems$.pipe(
    startWith(0),
    switchMap(page =>
      this.thirdwebService.getAllItems(page).pipe(
        map((nfts: NFT[]) => {
          return nfts.map(nft => ItemMapper.convertNftToItem(nft));
        }),
        catchError(() => {
          return of(undefined);
        })
      )
    ),
    shareReplay(1)
  );
  private status$ = merge(
    merge(this.getItems$).pipe(map(() => 'loading' as const)),
    this.items$.pipe(
      filter(res => !!res),
      map(() => 'completed' as const)
    )
  );
  items = toSignal(this.items$, { initialValue: [] });
  status = toSignal(this.status$, { initialValue: 'loading' });
}
