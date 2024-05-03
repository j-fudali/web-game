import { CharacterClass } from '../enums/character-class.enum';

export interface PlayerCharacter {
  name: string;
  image: string;
  level: number;
  energy: number;
  health: number;
  powerPoints: number;
  characterClass: CharacterClass;
}
