import { inject, Injectable } from '@angular/core';
import { ThirdwebService } from '../../../../../../shared/thirdweb/thirdweb.service';
import {
  catchError,
  combineLatest,
  filter,
  map,
  merge,
  of,
  shareReplay,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { ItemMapper } from '../../../../../../shared/utils/item-mapper';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Item } from '../../../../../../shared/interfaces/item';
import { WalletService } from '../../../../../../shared/services/wallet.service';
import { ClaimCondition } from 'thirdweb/dist/types/utils/extensions/drops/types';
import { UpdateItem } from '../../../../../../shared/thirdweb/model/update-item.model';

@Injectable()
export class ItemDetailsService {
  private thirdwebService = inject(ThirdwebService);
  private walletService = inject(WalletService);
  private account$ = toObservable(this.walletService.state.account);
  private error$ = new Subject<Error>();
  getItem$ = new Subject<number>();
  updateItem$ = new Subject<{
    id: bigint;
    updateItem: UpdateItem & { amountToClaim: number };
  }>();
  private onGetItem$ = this.getItem$.pipe(
    switchMap(id =>
      combineLatest([
        this.thirdwebService
          .getItemById(id)
          .pipe(map(nft => ItemMapper.convertNftToItem(nft))),
        this.thirdwebService.getClaimConditionMaxClaimableSupply(id),
      ]).pipe(catchError(() => of(undefined)))
    ),
    shareReplay(1)
  );
  private amountToClaim$ = this.onGetItem$.pipe(
    map(data => (data ? data[1] : undefined))
  );
  private OnUpdateItem$ = combineLatest([
    this.updateItem$,
    this.account$.pipe(filter(acc => !!acc)),
    this.amountToClaim$.pipe(
      filter(res => !!res),
      map(conditions => conditions as ClaimCondition[])
    ),
  ]).pipe(
    switchMap(([{ id, updateItem }, account, amountToClaim]) =>
      combineLatest([
        this.thirdwebService.updateItem(account, id, updateItem),
        this.thirdwebService.updateClaimCondition(
          account,
          amountToClaim[0],
          updateItem.amountToClaim
        ),
      ]).pipe(
        catchError(err => {
          this.error$.next(err);
          return of(undefined);
        })
      )
    )
  );
  private status$ = merge(
    this.getItem$.pipe(map(() => 'loading' as const)),
    this.onGetItem$.pipe(
      filter(res => !!res),
      map(() => 'completed' as const)
    ),
    this.updateItem$.pipe(map(() => 'update-loading' as const)),
    this.OnUpdateItem$.pipe(
      filter(res => res !== undefined),
      map(() => 'update-success' as const)
    ),
    this.error$.pipe(map(() => 'error' as const))
  );
  item = toSignal(
    this.onGetItem$.pipe(map(data => (data ? data[0] : undefined))),
    {
      initialValue: undefined,
    }
  );
  amountToClaim = toSignal(
    this.amountToClaim$.pipe(
      map(conditions =>
        conditions ? conditions[0].maxClaimableSupply : undefined
      )
    ),
    {
      initialValue: undefined,
    }
  );
  status = toSignal(this.status$, { initialValue: 'loading' as const });
}
