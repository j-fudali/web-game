import { inject, Injectable } from '@angular/core';
import { ThirdwebService } from '../../../../shared/thirdweb/thirdweb.service';
import { shareReplay, Subject, switchMap, startWith } from 'rxjs';
import { DirectListing } from 'thirdweb/extensions/marketplace';

@Injectable()
export class BuyLootboxesService {
  private thirdwebService = inject(ThirdwebService);
  pageLootboxes$ = new Subject<number>();

  private lootboxes$ = this.pageLootboxes$.pipe(
    startWith(0),
    switchMap(page => this.thirdwebService.getPacks(page)),
    shareReplay(1)
  );

  getTotalRecords$() {
    return this.thirdwebService.getTotalPacksListings();
  }
  getLootboxes$() {
    return this.lootboxes$;
  }
  buyLootbox$(listing: DirectListing) {
    return this.thirdwebService.buyPack(
      listing.id,
      listing.currencyValuePerToken.value
    );
  }
}
