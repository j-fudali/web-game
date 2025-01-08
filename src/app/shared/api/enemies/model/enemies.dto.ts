import { EnemyDto } from './enemy.dto';

export type EnemiesDto = Omit<
  EnemyDto,
  'maxHealth' | 'maxPowerPoints' | 'armor' | 'weapon'
> & { id: string };
