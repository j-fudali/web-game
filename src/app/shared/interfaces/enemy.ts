import { Character } from './character';
import { PublicUser } from './public-user';
import { Statistics } from './statistics';

export interface EnemyWeapon {
  name: string;
  image: string;
  damage: number;
}
export interface EnemyDto extends Character {
  id: string;
  description: string;
  weapon: EnemyWeapon;
  armor: number;
  maxHealth: number;
  maxPowerPoints: number;
  modifiedBy: PublicUser;
  lastModified: Date;
}
export type Enemy = Omit<EnemyDto, 'maxHealth' | 'maxPowerPoints'> & {
  statistics: Statistics;
};
export type EnemyOnEncounterDraw = Omit<
  EnemyDto,
  'id' | 'modifiedBy' | 'lastModified'
>;
