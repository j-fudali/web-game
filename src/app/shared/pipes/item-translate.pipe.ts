import { Pipe, type PipeTransform } from '@angular/core';
import { ItemType } from '../enums/item-type.enum';

@Pipe({
  name: 'jfudaliItemTranslate',
  standalone: true,
})
export class ItemTranslatePipe implements PipeTransform {

  transform(value: ItemType): string {
    return value === ItemType.Weapon ? 'Broń' : 'Pancerz';
  }

}
