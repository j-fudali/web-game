import { NFT } from 'thirdweb';
import {
  Trait,
  Attributes,
} from '../../features/game/services/starting-items.service';
import { Item } from '../interfaces/item';
import { IpfsConverter } from './ipfs-converter';
import { OwnedItem } from '../interfaces/owned-item';

export class ItemMapper {
  public static createTraits(attributes: Record<string, unknown>) {
    return Object.entries(attributes!).map(([k, v]) => v as Trait);
  }
  private static mapAttributes(
    attributes: Record<string, unknown>
  ): Partial<Attributes> {
    const result: Partial<Attributes> = {};
    const mappedAttributes = this.createTraits(attributes);
    mappedAttributes.forEach(trait => {
      switch (trait.trait_type) {
        case 'classType':
          result.classType = trait.value as Attributes['classType'];
          break;
        case 'type':
          result.type = trait.value as Attributes['type'];
          break;
        case 'damage':
          result.damage = Number(trait.value);
          break;
        case 'armor':
          result.armor = Number(trait.value);
          break;
        case 'bodySlot':
          result.bodySlot = trait.value as Attributes['bodySlot'];
          break;
        default:
          break;
      }
    });
    return result;
  }
  public static convertNftToItem(nft: NFT): Item {
    const tokenId = nft.id;
    const { name, image, attributes, properties } = nft.metadata;
    let result = {};
    if (attributes) result = this.mapAttributes(attributes);
    if (properties) result = this.mapAttributes(properties);
    return {
      ...result,
      name,
      tokenId,
      image: image ? IpfsConverter.convertIpfs(image) : undefined,
    } as Item;
  }
  public static convertItemToOwnedItem(item: Item, quantity: bigint) {
    return { quantity, ...item } as OwnedItem;
  }
}
