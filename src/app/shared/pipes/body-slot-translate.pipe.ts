import { Pipe, type PipeTransform } from '@angular/core';
import { BodySlot } from '../enums/body-slot.enum';

@Pipe({
  name: 'jfudaliBodySlotTranslate',
  standalone: true,
})
export class BodySlotTranslatePipe implements PipeTransform {

  transform(value: BodySlot): string {
    switch(value){
      case BodySlot.Arms:
        return 'Ręce'
      case BodySlot.Chest:
        return 'Klatka'
      case BodySlot.Head:
        return 'Głowa'
      case BodySlot.Legs:
        return 'Nogi'
      default:
        return 'Nieznany'
    }
  }

}
