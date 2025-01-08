import { DecisionDto } from './decision.dto';

export interface NewEncounterDto {
  title: string;
  description: string;
  difficulity: number;
  decisions?: DecisionDto[];
  enemyId?: string;
}
