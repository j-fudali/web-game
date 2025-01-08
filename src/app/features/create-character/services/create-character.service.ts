import { inject, Injectable } from '@angular/core';
import { CharacterClassesService } from 'app/shared/services/character-classes.service';
import { ThirdwebService } from 'app/shared/thirdweb/thirdweb.service';
import { ItemMapper } from 'app/shared/utils/item-mapper';
import { map, Observable, switchMap } from 'rxjs';
import { CharacterClassDto } from 'app/shared/api/character-classes';
import { PlayerCharacterApiService } from 'app/shared/api/player-character';
import { CreateCharacter } from 'app/features/game/interfaces/create-character';
import { Item } from 'app/shared/interfaces/item';

@Injectable()
export class CreateCharacterService {
  private _thirdwebService = inject(ThirdwebService);
  private _playerCharacterApiService = inject(PlayerCharacterApiService);
  private _characterService = inject(CharacterClassesService);

  getStartingWeaponOnClassSelect$(characterClass: CharacterClassDto) {
    return this.getStartingWeapons$().pipe(
      map(items => items.find(i => i.classType === characterClass.name))
    );
  }
  getCharacterClasses$() {
    return this._characterService.getCharacterClasses$();
  }
  createCharacter$(newCharacter: CreateCharacter): Observable<unknown> {
    return this._thirdwebService
      .claimStartingWeapon(BigInt(newCharacter.equippedItems[0]))
      .pipe(
        switchMap(() =>
          this._playerCharacterApiService.createCharacter(newCharacter)
        )
      );
  }
  private getStartingWeapons$(): Observable<Item[]> {
    return this._thirdwebService
      .getStartingItems()
      .pipe(map(nfts => nfts.map(nft => ItemMapper.convertNftToItem(nft))));
  }
}
