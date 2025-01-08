import { CharacterClassDto } from '../../character-classes/model/character-class.dto';
import { Character } from '../../../interfaces/character';
import { Statistics } from '../../../interfaces/statistics';

export interface PlayerCharacterDto extends Character {
  statistics: Statistics;
  characterClass: CharacterClassDto;
  equippedItems: bigint[];
}
export type PlayerCharacterApiResponse = Omit<
  PlayerCharacterDto,
  'equippedItems'
> & { equippedItems: string[] };
