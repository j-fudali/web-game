import { DecisionDto } from './decision.dto';
import { PublicUser } from '../../../interfaces/public-user';
import { EnemyDto } from '../../enemies/model/enemy.dto';

export interface EncounterDto {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  decisions?: DecisionDto[];
  enemy?: EnemyDto;
  modifiedBy: PublicUser;
  lastModified: Date;
}
