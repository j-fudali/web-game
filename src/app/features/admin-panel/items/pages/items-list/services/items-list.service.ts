import { inject, Injectable, signal } from '@angular/core';
import { ThirdwebService } from '../../../../../../shared/thirdweb/thirdweb.service';
import {
  catchError,
  combineLatest,
  EMPTY,
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
  addToPack$ = new Subject<{ tokenId: bigint; quantity: bigint }>();

  private onAddToPack$ = combineLatest([
    this.addToPack$,
    this.account$.pipe(filter(acc => !!acc)),
  ]).pipe(
    switchMap(([{ tokenId, quantity }, acc]) =>
      this.thirdwebService.claimItem(acc, tokenId, quantity).pipe(
        map(() => ({ acc, tokenId, quantity })),
        catchError(err => {
          console.log(err);
          return EMPTY;
        })
      )
    ),
    switchMap(({ acc, tokenId, quantity }) =>
      this.thirdwebService.addToPack(acc, tokenId, quantity).pipe(
        map(() => ({ acc, quantity })),
        catchError(err => {
          console.log(err);
          return EMPTY;
        })
      )
    ),
    switchMap(({ acc, quantity }) =>
      this.thirdwebService.updateLootboxListing(acc, quantity).pipe(
        catchError(err => {
          console.log(err);
          return EMPTY;
        })
      )
    ),
    catchError(() => of(undefined)),
    shareReplay(1)
    //claim itemu
    //addPackContents - dodaje do paczki
    //update listingu skrzyni
  );
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
    ),
    this.addToPack$.pipe(map(() => 'add-to-pack-loading' as const)),
    this.onAddToPack$.pipe(
      filter(res => !!res),
      map(() => 'add-to-pack-success' as const)
    )
  );
  items = toSignal(this.items$, { initialValue: [] });
  status = toSignal(this.status$, { initialValue: 'loading' });
}
