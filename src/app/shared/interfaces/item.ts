import { ClassType } from "../enums/class-type.enum";
import { ItemType } from "../enums/item-type.enum";

export interface Item {
  tokenId: bigint;
  name: string;
  image: string;
  classType: ClassType;
  type: ItemType;
  damage?: number;
  armor?: number;
  bodySlot?: string;
}
