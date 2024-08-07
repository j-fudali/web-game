import { Character } from './character';
import { CharacterClass } from './character-class';
import { Statistics } from './statistics';

export interface PlayerCharacter extends Character {
  statistics: Statistics;
  characterClass: CharacterClass;
  equippedItems: bigint[];
}
