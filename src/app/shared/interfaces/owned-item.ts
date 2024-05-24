import { Item } from './item';

export interface OwnedItem extends Item {
  quantity: bigint;
}
