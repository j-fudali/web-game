import { Character } from '../../../interfaces/character';
import { EnemyWeapon } from '../../../interfaces/enemy';
import { PublicUser } from '../../../interfaces/public-user';

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
