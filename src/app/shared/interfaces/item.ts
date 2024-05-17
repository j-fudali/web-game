export interface Item {
  name: string;
  classType: 'warrior' | 'wizard' | 'rouge';
  type: 'weapon' | 'armor';
  damage: number;
  bodySlot?: string;
}
