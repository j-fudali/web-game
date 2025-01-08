import { Character } from '../../../interfaces/character';
import { EnemyWeapon } from '../../../interfaces/enemy';
import { PublicUser } from '../../../interfaces/public-user';

export interface EnemyDto extends Character {
  description: string;
  maxHealth: number;
  maxPowerPoints: number;
  weapon: EnemyWeapon;
  armor: number;
  modifiedBy: PublicUser;
  lastModified: Date;
}
