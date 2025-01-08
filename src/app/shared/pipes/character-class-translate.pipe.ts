import { CharacterClassDto } from './../api/character-classes/model/character-class.dto';
import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'jfudaliCharacterClassTranslate',
  standalone: true,
})
export class CharacterClassTranslatePipe implements PipeTransform {
  transform(value: CharacterClassDto): string {
    switch (value.name) {
      case 'warrior':
        return 'Wojownik';
      case 'wizard':
        return 'Mag';
      case 'rouge':
        return 'Łotr';
      default:
        return '';
    }
  }
}
