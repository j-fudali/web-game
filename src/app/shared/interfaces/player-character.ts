import { CharacterClass } from './character-class';
import { Statistics } from './statistics';

export interface PlayerCharacter {
  name: string;
  image: string;
  level: number;
  statistics: Statistics;
  characterClass: CharacterClass;
}
