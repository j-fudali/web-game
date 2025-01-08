import { DecisionDto } from './decision.dto';

export interface UpdateEncounterDto {
  title?: string;
  description?: string;
  difficulity?: number;
  decisions?: DecisionDto[];
  enemyId?: string;
}
