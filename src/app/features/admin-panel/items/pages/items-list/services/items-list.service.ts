import { inject, Injectable } from '@angular/core';
import { ThirdwebService } from '../../../../../../shared/thirdweb/thirdweb.service';
import {
  catchError,
  combineLatest,
  filter,
  map,
  Observable,
  of,
  shareReplay,
  startWith,
  Subject,
  switchMap,
} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { ItemMapper } from '../../../../../../shared/utils/item-mapper';
import { NFT } from 'thirdweb';
import { NFTMetadata } from 'thirdweb/dist/types/utils/nft/parseNft';
import { DialogService } from 'primeng/dynamicdialog';
import { PackMetadataFormComponent } from '../../../ui/pack-metadata-form/pack-metadata-form.component';

@Injectable()
export class ItemsListService {
  private thirdwebService = inject(ThirdwebService);
  private dialogService = inject(DialogService);
  getItems$ = new Subject<number>();

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

  items = toSignal(this.items$.pipe(map(res => res[0])), { initialValue: [] });
  totalAmount = toSignal(
    this.items$.pipe(map(res => (res ? Number(res[1]) : undefined))),
    {
      initialValue: undefined,
    }
  );

  createPack$(
    items: { tokenId: bigint; totalRewards: number }[]
  ): Observable<unknown> {
    return this.getPackMetadata().pipe(
      map(packData => ({
        data: { packData: packData, items },
      })),
      switchMap(({ data }) =>
        this.thirdwebService.claimItems(data.items).pipe(map(() => ({ data })))
      ),
      switchMap(({ data }) =>
        this.thirdwebService.addNewPack(data.packData, data.items).pipe(
          map(createdPack => {
            return { createdPack, price: data.packData.price };
          })
        )
      ),
      switchMap(({ createdPack, price }) =>
        this.thirdwebService.createPackListing(
          createdPack.packId,
          createdPack.quantity,
          price
        )
      )
    );
  }
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
