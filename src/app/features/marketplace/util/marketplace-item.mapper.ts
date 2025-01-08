import { ItemMapper } from 'app/shared/utils/item-mapper';
import { DirectListing } from 'thirdweb/extensions/marketplace';
import { MarketplaceItem } from '../interfaces/marketplace-item';

export class MarketplaceItemMapper {
  public static mapListingToMarketplaceItem(listing: DirectListing) {
    return {
      listingId: listing.id,
      balance: listing.currencyValuePerToken,
      creatorAddress: listing.creatorAddress,
      ...ItemMapper.convertNftToItem(listing.asset),
    } as MarketplaceItem;
  }
}
