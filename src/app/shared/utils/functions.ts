import { PlayerCharacter } from '../interfaces/player-character';
import { Enemy } from '../interfaces/enemy';

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
        actualValue: Math.max(
          character.statistics.health.actualValue - damage,
          0
        ),
      },
    },
  };
};

export const restoreHealth = (
  character: PlayerCharacter | Enemy,
  health: number
) => {
  return {
    ...character,
    statistics: {
      ...character.statistics,
      health: {
        ...character.statistics.health,
        actualValue: Math.min(
          character.statistics.health.actualValue + health,
          character.statistics.health.maximumValue
        ),
      },
    },
  };
};
export const restoreEnergy = (character: PlayerCharacter, energy: number) => {
  return {
    ...character,
    statistics: {
      ...character.statistics,
      energy: {
        ...character.statistics.energy,
        actualValue: Math.min(
          character.statistics.energy.actualValue + energy,
          character.statistics.energy.maximumValue
        ),
      },
    },
  } as PlayerCharacter;
};
export const reduceEnergyByTen = (character: PlayerCharacter) => {
  return {
    ...character,
    statistics: {
      ...character.statistics,
      energy: {
        ...character.statistics.energy,
        actualValue: Math.max(character.statistics.energy.actualValue - 10, 0),
      },
    },
  } as PlayerCharacter;
};
