import { inject, Injectable } from '@angular/core';
import { ThirdwebService } from '../../../../shared/thirdweb/thirdweb.service';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  filter,
  map,
  merge,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { DialogService } from 'primeng/dynamicdialog';
import { RewardComponent } from '../ui/reward/reward.component';
import { TEXTS } from '../../texts/texts.const';

@Injectable()
export class OpenLootboxService {
  private dialogService = inject(DialogService);
  private _thirdwebService = inject(ThirdwebService);

  openLootbox$ = new Subject<bigint>();
  getOwnedLootboxes$ = new Subject<number>();

  private onOpenLootbox$ = this.openLootbox$.pipe(
    switchMap(packId =>
      this._thirdwebService.openPack(packId).pipe(
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
            header: TEXTS.OPEN_LOOTBOX_REWARD,
          })
        )
      )
    ),
    tap(() => this.getOwnedLootboxes$.next(0)),
    shareReplay(1)
  );
  private userLootboxes$ = this.getOwnedLootboxes$.pipe().pipe(
    startWith(0),
    switchMap(page => this._thirdwebService.getOwnedPacks(page)),
    shareReplay(1)
  );

  getUserLootboxes$() {
    return this.userLootboxes$;
  }
  getReward$() {
    return this.onOpenLootbox$;
  }
}
