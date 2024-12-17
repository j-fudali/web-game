import { BodySlot } from '../../enums/body-slot.enum';
import { ClassType } from '../../enums/class-type.enum';
import { ItemType } from '../../enums/item-type.enum';

export interface NewItem {
  name: string;
  description: string;
  image: File;
  classType: ClassType;
  type: ItemType;
  amountToClaim: number;
  damage?: number;
  armor?: number;
  bodySlot?: BodySlot;
}
