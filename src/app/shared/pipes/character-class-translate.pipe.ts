import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'jfudaliCharacterClassTranslate',
  standalone: true,
})
export class CharacterClassTranslatePipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return value;
  }

}
