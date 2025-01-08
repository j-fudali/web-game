import { EnemyWeapon } from 'app/shared/interfaces/enemy';
import { DecisionDto } from './decision.dto';

export interface RandomEncounterEnemyDto {
  name: string;
  image: string;
  description: string;
  weapon: EnemyWeapon;
  armor: number;
  maxHealth: number;
  maxPowerPoints: number;
}
export interface RandomEncounterDto {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  decisions?: DecisionDto[];
  enemy?: RandomEncounterEnemyDto;
}
