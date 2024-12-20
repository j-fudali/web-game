import { inject, Injectable, signal } from '@angular/core';
import { ThirdwebService } from '../../../../../../shared/thirdweb/thirdweb.service';
import {
  catchError,
  combineLatest,
  concat,
  EMPTY,
  filter,
  forkJoin,
  map,
  merge,
  Observable,
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
import { NFTMetadata } from 'thirdweb/dist/types/utils/nft/parseNft';
import { DialogService } from 'primeng/dynamicdialog';
import { PackMetadataFormComponent } from '../../../ui/pack-metadata-form/pack-metadata-form.component';

@Injectable()
export class ItemsListService {
  private thirdwebService = inject(ThirdwebService);
  private walletService = inject(WalletService);
  private dialogService = inject(DialogService);
  private account$ = toObservable(this.walletService.state.account);
  getItems$ = new Subject<number>();
  createPack$ = new Subject<{ tokenId: bigint; totalRewards: number }[]>();

  private onCreatePack$ = combineLatest([
    this.account$.pipe(filter(acc => !!acc)),
    this.createPack$,
  ]).pipe(
    switchMap(([acc, items]) =>
      this.getPackMetadata().pipe(
        map(packData => ({
          acc,
          data: { packData: packData, items },
        })),
        catchError(err => {
          console.log(err);
          return EMPTY;
        })
      )
    ),
    switchMap(({ acc, data }) =>
      this.thirdwebService.claimItems(acc, data.items).pipe(
        map(() => ({ acc, data })),
        catchError(err => {
          console.log(err);
          return EMPTY;
        })
      )
    ),
    switchMap(({ acc, data }) =>
      this.thirdwebService.addNewPack(acc, data.packData, data.items).pipe(
        map(createdPack => {
          return { acc, createdPack, price: data.packData.price };
        }),
        catchError(err => {
          console.log(err);
          return EMPTY;
        })
      )
    ),
    switchMap(({ acc, createdPack, price }) =>
      this.thirdwebService.createPackListing(
        acc,
        createdPack.packId,
        createdPack.quantity,
        price
      )
    ),
    catchError(() => of(undefined))
  );

  private items$ = this.getItems$.pipe(
    startWith(0),
    switchMap(page =>
      combineLatest([
        this.thirdwebService.getAllItems(page).pipe(
          map((nfts: NFT[]) => {
            return nfts.map(nft => ItemMapper.convertNftToItem(nft));
          }),
          catchError(() => {
            return of(undefined);
          })
        ),
        this.thirdwebService.getTotalAmountOfItems(),
      ])
    ),
    shareReplay(1)
  );
  private status$ = merge(
    this.getItems$.pipe(map(() => 'loading' as const)),
    this.items$.pipe(
      filter(res => !!res),
      map(() => 'completed' as const)
    ),
    this.createPack$.pipe(map(() => 'create-pack-loading' as const)),
    this.onCreatePack$.pipe(
      filter(res => !!res),
      map(() => 'create-pack-success' as const)
    )
  );
  items = toSignal(this.items$.pipe(map(res => res[0])), { initialValue: [] });
  totalAmount = toSignal(
    this.items$.pipe(map(res => (res ? Number(res[1]) : undefined))),
    {
      initialValue: undefined,
    }
  );
  status = toSignal(this.status$, { initialValue: 'loading' });

  private getPackMetadata(): Observable<NFTMetadata & { price: number }> {
    const ref = this.dialogService.open(PackMetadataFormComponent, {
      header: 'Informacje o skrzyni',
      width: '50vw',
      breakpoints: {
        '1499px': '60vw',
        '1199px': '75vw',
        '799px': '90vw',
      },
    });
    return ref.onClose.pipe(
      filter(data => !!data),
      switchMap(data =>
        this.thirdwebService
          .uploadImage(data.image)
          .pipe(map(image => ({ ...data, image })))
      ),
      map(data => data as NFTMetadata & { price: number })
    );
  }
}
