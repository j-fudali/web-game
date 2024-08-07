import { Decision } from './decision';
import { Enemy, EnemyDto, EnemyOnEncounterDraw } from './enemy';
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
  decisions: Decision[];
}
export interface EnemyEncounter extends BaseEncounter {
  enemy: Enemy;
}
export interface EnemyEncounterDto extends BaseEncounter {
  enemy: EnemyDto;
}
export type Encounter = DecisionEncounter | EnemyEncounter | EnemyEncounterDto;
export type EncounterOnDraw = Exclude<
  Encounter,
  ['difficulty', 'modifiedBy', 'lastModified']
>;
