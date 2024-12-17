import { inject, Injectable } from '@angular/core';
import { ThirdwebService } from '../../../../../../shared/thirdweb/thirdweb.service';
import {
  filter,
  Subject,
  switchMap,
  combineLatest,
  catchError,
  EMPTY,
  shareReplay,
  merge,
  map,
  of,
} from 'rxjs';
import { NewItem } from '../../../../../../shared/thirdweb/model/new-item.model';
import { WalletService } from '../../../../../../shared/services/wallet.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Injectable()
export class AddItemService {
  private thirdwebService = inject(ThirdwebService);
  private walletService = inject(WalletService);
  private account$ = toObservable(this.walletService.state.account).pipe(
    filter(acc => !!acc)
  );
  addItem$ = new Subject<NewItem>();

  private onAddItem$ = combineLatest([this.addItem$, this.account$]).pipe(
    switchMap(([item, acc]) =>
      this.thirdwebService.createItem(acc, item).pipe(
        catchError(() => {
          return of(undefined);
        })
      )
    ),
    shareReplay(1)
  );
  private status$ = merge(
    this.addItem$.pipe(map(() => 'loading' as const)),
    this.onAddItem$.pipe(
      filter(res => res !== undefined),
      map(() => 'success' as const)
    )
  );
  status = toSignal(this.status$, { initialValue: null });
}
