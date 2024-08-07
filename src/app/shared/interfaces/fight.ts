export interface Round {
  playerHitPointsValue: number;
  enemyHitPointsValue: number;
  dealtDamage: number;
}

export interface Fight {
  rounds: Round[];
  userWon: boolean;
}
