import { CharacterClass } from '../../../shared/interfaces/character-class';

export interface CreateCharacter {
  name: string;
  image: File;
  characterClassId: string;
}
