import { StatisticValues } from './statistic-values';

export interface Statistics {
  energy: StatisticValues;
  health: StatisticValues;
  powerPoints: StatisticValues;
}
export type EnemyStatistics = Omit<Statistics, 'energy'>;
