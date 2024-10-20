import { NFT } from 'thirdweb';
import {
  Trait,
  Attributes,
} from '../../features/game/services/starting-items.service';
import { Item } from '../interfaces/item';
import { PlayerCharacter } from '../interfaces/player-character';
import { Enemy } from '../interfaces/enemy';

export const convertIpfs = (image: string) =>
  `http://ipfs.io/ipfs/${image.substring(7)}`;

export const convertNftToItem = ({
  tokenId,
  name,
  image,
  attributes,
}: NFT['metadata'] & { tokenId: bigint }): Item => {
  const mappedAttributes = Object.entries(attributes!).map(
    ([k, v]) => v as Trait
  );
  const result: Partial<Attributes> = {};
  mappedAttributes.forEach((trait) => {
    switch (trait.trait_type) {
      case 'classType':
        result.classType = trait.value as Attributes['classType'];
        break;
      case 'type':
        result.type = trait.value as Attributes['type'];
        break;
      case 'damage':
        result.damage = Number(trait.value);
        break;
      case 'armor':
        result.armor = Number(trait.value);
        break;
      case 'bodySlot':
        result.bodySlot = trait.value as Attributes['bodySlot'];
        break;
      default:
        break;
    }
  });
  return {
    ...result,
    name,
    tokenId,
    image: image ? convertIpfs(image) : undefined,
  } as Item;
};

export const dealDamage = (
  character: PlayerCharacter | Enemy,
  damage: number
) => {
  return {
    ...character,
    statistics: {
      ...character.statistics,
      health: {
        ...character.statistics.health,
        actualValue: Math.max(character.statistics.health.actualValue - damage , 0)
      },
    },
  };
};

export const restoreHealth = (character: PlayerCharacter 
  | Enemy, health: number
) => {
  return {
    ...character,
    statistics: {
      ...character.statistics,
      health: {
        ...character.statistics.health,
        actualValue: Math.min(character.statistics.health.actualValue + health, character.statistics.health.maximumValue),
      },
    },
  } ;
}
export const restoreEnergy = (character: PlayerCharacter, energy: number) => {
  return {
    ...character,
    statistics: {
      ...character.statistics,
      energy: {
        ...character.statistics.energy,
        actualValue: Math.min(character.statistics.energy.actualValue + energy, character.statistics.energy.maximumValue)
      }
    }
  } as PlayerCharacter;
}
export const reduceEnergyByTen = (character: PlayerCharacter) => {
  return {
    ...character,
    statistics: {
      ...character.statistics,
      energy: {
        ...character.statistics.energy,
        actualValue: Math.max(character.statistics.energy.actualValue - 10, 0)
      }
    }
  } as PlayerCharacter
}

