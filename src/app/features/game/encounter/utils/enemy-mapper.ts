import { RandomEncounterEnemyDto } from 'app/shared/api/encounters';
import { Enemy } from 'app/shared/interfaces/enemy';

export class EnemyMapper {
  public static mapEncounterEnemyDtoToEnemy(
    enemy: RandomEncounterEnemyDto
  ): Enemy {
    return {
      ...enemy,
      statistics: {
        energy: {
          actualValue: 0,
          maximumValue: 0,
        },
        health: {
          actualValue: enemy.maxHealth,
          maximumValue: enemy.maxHealth,
        },
        powerPoints: {
          actualValue: enemy.maxPowerPoints,
          maximumValue: enemy.maxPowerPoints,
        },
      },
    };
  }
}
