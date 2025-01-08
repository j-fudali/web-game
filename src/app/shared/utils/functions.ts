import { Enemy } from 'app/shared/interfaces/enemy';
import { PlayerCharacterDto } from '../api/player-character/model/player-character.dto';

export function dealDamage<T extends PlayerCharacterDto | Enemy>(
  character: T,
  damage: number
): T {
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
}
export function restoreHealth<T extends PlayerCharacterDto | Enemy>(
  character: T,
  health: number
): T {
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
}
export function restoreEnergy<T extends PlayerCharacterDto | Enemy>(
  character: T,
  energy: number
): T {
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
  };
}
export function reduceEnergyByTen<T extends PlayerCharacterDto | Enemy>(
  character: T
): T {
  return {
    ...character,
    statistics: {
      ...character.statistics,
      energy: {
        ...character.statistics.energy,
        actualValue: Math.max(character.statistics.energy.actualValue - 10, 0),
      },
    },
  };
}
