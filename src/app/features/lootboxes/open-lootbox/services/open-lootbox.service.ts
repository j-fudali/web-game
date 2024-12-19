import { inject, Injectable } from '@angular/core';
import { ThirdwebService } from '../../../../shared/thirdweb/thirdweb.service';
import { WalletService } from '../../../../shared/services/wallet.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
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

@Injectable()
export class OpenLootboxService {
  private _thridweService = inject(ThirdwebService);
  private walletService = inject(WalletService);
  private account$ = toObservable(this.walletService.state.account);

  openLootbox$ = new Subject<void>();

  private onOpenLootbox$ = combineLatest([
    this.openLootbox$,
    this.account$.pipe(filter(acc => !!acc)),
  ]).pipe(
    switchMap(([_, acc]) =>
      this._thridweService.openPack(acc, this.userLootboxes()!.id)
    ),
    shareReplay(1)
  );
  private userLootboxes$ = this.account$.pipe(
    filter(acc => !!acc),
    switchMap(acc =>
      this._thridweService
        .getOwnedPacks(acc)
        .pipe(catchError(() => of(undefined)))
    ),
    shareReplay(1)
  );
  userLootboxes = toSignal(
    this.userLootboxes$.pipe(
      map(lootboxes => (lootboxes ? lootboxes[0] : undefined))
    ),
    { initialValue: undefined }
  );
  status = toSignal(
    merge(
      this.userLootboxes$.pipe(
        filter(res => !!res),
        map(() => 'completed')
      ),
      this.openLootbox$.pipe(map(() => 'loadings')),
      this.onOpenLootbox$.pipe(map(() => 'success'))
    ),
    { initialValue: 'loading' }
  );
}
