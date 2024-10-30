import { BodySlot } from '../enums/body-slot.enum';
import { ClassType } from '../enums/class-type.enum';
import { ItemType } from '../enums/item-type.enum';
export interface ItemProperties {
  name: string;
  image: string;
  classType: ClassType;
  type: ItemType;
  damage?: number;
  armor?: number;
  bodySlot?: BodySlot;
}
export interface Item extends ItemProperties {
  tokenId: bigint;
}
