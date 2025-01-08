export interface RoundDto {
  playerHitPointsValue: number;
  enemyHitPointsValue: number;
  dealtDamage: number;
}

export interface FightDto {
  rounds: RoundDto[];
  userWon: boolean;
  userLevelUp: boolean;
}
