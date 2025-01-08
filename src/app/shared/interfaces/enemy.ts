import { EnemyDto } from '../api/enemies/model/enemy.dto';
import { Statistics } from './statistics';

export interface EnemyWeapon {
  name: string;
  image: string;
  damage: number;
}

export type Enemy = Omit<
  EnemyDto,
  'level' | 'maxHealth' | 'maxPowerPoints' | 'lastModified' | 'modifiedBy'
> & {
  statistics: Statistics;
};
export type EnemyOnEncounterDraw = Omit<
  EnemyDto,
  'id' | 'modifiedBy' | 'lastModified'
>;
