import { inject, Injectable } from '@angular/core';
import { ThirdwebService } from '../../../../shared/thirdweb/thirdweb.service';
import { Subject } from 'rxjs';
import { DirectListing } from 'thirdweb/extensions/marketplace';

@Injectable()
export class BuyLootboxesService {
  private thirdwebService = inject(ThirdwebService);
  pageLootboxes$ = new Subject<number>();

  getTotalRecords$() {
    return this.thirdwebService.getTotalPacksListings();
  }
  getLootboxes$() {
    return this.thirdwebService.getPacks();
  }
  buyLootbox$(listing: DirectListing) {
    return this.thirdwebService.buyPack(
      listing.id,
      listing.currencyValuePerToken.value
    );
  }
}
