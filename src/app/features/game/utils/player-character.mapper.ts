import { PlayerCharacterApiResponse } from 'app/shared/api/player-character';

export class PlayerCharacterMapper {
  public static toPlayerCharacterDto(pc: PlayerCharacterApiResponse) {
    return {
      ...pc,
      equippedItems: pc.equippedItems.map(i => BigInt(i)),
    };
  }
}
