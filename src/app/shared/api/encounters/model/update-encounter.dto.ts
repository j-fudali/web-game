import { NewDecisionDto } from './new-decision.dto';

export interface UpdateEncounterDto {
  title?: string;
  description?: string;
  difficulity?: number;
  decisions?: NewDecisionDto[];
  enemyId?: string;
}
