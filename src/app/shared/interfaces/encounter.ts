import { EnemyDto } from '../api/enemies/model/enemy.dto';
import { DecisionDto } from '../api/encounters/model/decision.dto';
import { Enemy } from './enemy';
import { PublicUser } from './public-user';

interface BaseEncounter {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  modifiedBy: PublicUser;
  lastModified: Date;
}
export interface DecisionEncounter extends BaseEncounter {
  decisions: DecisionDto[];
}
export interface EnemyEncounter extends BaseEncounter {
  enemy: Enemy;
}
export interface EnemyEncounterDto extends BaseEncounter {
  enemy: EnemyDto & { id: string };
}
export type Encounter = DecisionEncounter | EnemyEncounter | EnemyEncounterDto;
export type EncounterOnDraw = Exclude<
  Encounter,
  ['difficulty', 'modifiedBy', 'lastModified']
>;
