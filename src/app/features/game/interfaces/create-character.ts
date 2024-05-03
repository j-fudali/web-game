import { CharacterClass } from '../../../shared/enums/character-class.enum';

export interface CreateCharacter {
  name: string;
  image: File;
  characterClass: CharacterClass;
}
