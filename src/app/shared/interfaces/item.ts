export interface Item {
  tokenId: bigint;
  name: string;
  image: string;
  classType: 'warrior' | 'wizard' | 'rouge';
  type: 'weapon' | 'armor';
  damage?: number;
  armor?: number;
  bodySlot?: string;
}
