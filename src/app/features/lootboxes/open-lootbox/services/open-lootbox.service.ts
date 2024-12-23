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
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { RewardComponent } from '../ui/reward/reward.component';
import { Texts } from '../../texts/texts.const';

@Injectable()
export class OpenLootboxService {
  private dialogService = inject(DialogService);
  private _thirdwebService = inject(ThirdwebService);
  private walletService = inject(WalletService);
  private account$ = toObservable(this.walletService.state.account);

  openLootbox$ = new Subject<bigint>();
  getOwnedLootboxes$ = new Subject<number>();

  private onOpenLootbox$ = combineLatest([
    this.openLootbox$,
    this.account$.pipe(filter(acc => !!acc)),
  ]).pipe(
    switchMap(([packId, acc]) =>
      this._thirdwebService.openPack(acc, packId).pipe(
        tap(nft =>
          this.dialogService.open(RewardComponent, {
            data: {
              nft,
            },
            closable: true,
            width: '30vw',
            breakpoints: {
              '1499px': '30vw',
              '1199px': '50vw',
              '799px': '80vw',
            },
            header: Texts.OPEN_LOOTBOX_REWARD,
          })
        ),
        catchError(() => of(undefined))
      )
    ),
    shareReplay(1)
  );
  private userLootboxes$ = combineLatest([
    this.getOwnedLootboxes$.pipe(startWith(0)),
    this.account$.pipe(filter(acc => !!acc)),
  ]).pipe(
    switchMap(([page, acc]) =>
      this._thirdwebService
        .getOwnedPacks(acc, page)
        .pipe(catchError(() => of(undefined)))
    ),
    shareReplay(1)
  );
  private status$ = merge(
    this.userLootboxes$.pipe(
      filter(res => !!res),
      map(() => 'completed')
    ),
    this.openLootbox$.pipe(map(() => 'open-pack-loading')),
    this.onOpenLootbox$.pipe(map(() => 'open-pack-success'))
  );
  userLootboxes = toSignal(this.userLootboxes$, {
    initialValue: undefined,
  });
  reward = toSignal(this.onOpenLootbox$, { initialValue: undefined });
  status = toSignal(this.status$, { initialValue: 'loading' });
}
