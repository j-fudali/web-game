import { Pipe, type PipeTransform } from '@angular/core';
import { MarketplaceItem } from '../interfaces/marketplace-item';
import { OwnedItem } from '../../../shared/interfaces/owned-item';

@Pipe({
  name: 'jfudaliAlreadyInSell',
  standalone: true,
})
export class AlreadyInSellPipe implements PipeTransform {

  transform(itemsToBuy: MarketplaceItem[], item: OwnedItem, creatorAddress: string): boolean {
    return itemsToBuy.find(i => i.tokenId === item.tokenId && i.creatorAddress === creatorAddress) ? true: false;
  }

}
