import { Decision } from '../../../interfaces/decision';
import { Enemy } from '../../../interfaces/enemy';
import { PublicUser } from '../../../interfaces/public-user';

export interface EncounterDto {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  decisions?: Decision[];
  enemy?: Enemy;
  modifiedBy: PublicUser;
  lastModified: Date;
}
