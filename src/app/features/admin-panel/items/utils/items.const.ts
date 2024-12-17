import { BodySlot } from '../../../../shared/enums/body-slot.enum';
import { ClassType } from '../../../../shared/enums/class-type.enum';
import { ItemType } from '../../../../shared/enums/item-type.enum';
import { DropdownBodySlot } from '../ui/item-form/interfaces/dropdown-body-slot';
import { DropdownClassType } from '../ui/item-form/interfaces/dropdown-class-type';
import { DropdownItemType } from '../ui/item-form/interfaces/dropdown-item-type';

export class Constants {
  public static BODY_SLOTS: DropdownBodySlot[] = [
    { name: 'Ręce', value: BodySlot.Arms },
    { name: 'Nogi', value: BodySlot.Legs },
    { name: 'Klatka', value: BodySlot.Chest },
    { name: 'Głowa', value: BodySlot.Head },
  ];
  public static ITEM_TYPES: DropdownItemType[] = [
    {
      name: 'Broń',
      value: ItemType.Weapon,
    },
    { name: 'Pancerz', value: ItemType.Armor },
  ];
  public static CLASS_TYPES: DropdownClassType[] = [
    {
      name: 'Wojownik',
      value: ClassType.Warrior,
    },
    {
      name: 'Mag',
      value: ClassType.Wizard,
    },
    {
      name: 'Łotr',
      value: ClassType.Rouge,
    },
    {
      name: 'Każdy',
      value: ClassType.Any,
    },
  ];
}
