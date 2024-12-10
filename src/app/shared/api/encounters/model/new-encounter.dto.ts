import { NewDecisionDto } from './new-decision.dto';

export interface NewEncounterDto {
  title: string;
  description: string;
  difficulity: number;
  decisions: NewDecisionDto[];
  enemyId?: string;
}
