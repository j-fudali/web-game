export interface NewEnemyDto {
  name: string;
  description: string;
  image: File;
  level: number;
  maxHealth: number;
  maxPowerPoints: number;
  weaponName: string;
  weaponImage: File;
  damage: number;
  armor: number;
}
