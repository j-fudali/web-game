import { Injectable, inject } from '@angular/core';
import {
  combineLatest,
  distinctUntilChanged,
  map,
  shareReplay,
  tap,
} from 'rxjs';
import { PlayerCharacterService } from './player-character.service';
import { ItemsService } from '../../../shared/services/items.service';
import { ItemsApiService } from '../../../shared/api/items/items-api.service';

@Injectable()
export class EquipmentService {
  private _itemsApiService = inject(ItemsApiService);
  private _playerService = inject(PlayerCharacterService);
  private _itemsService = inject(ItemsService);
  private ownedItems$ = this._itemsService
    .getOwnedItems$()
    .pipe(shareReplay(1));
  private playerCharacter$ = this._playerService.getPlayerCharacter$();
  saveEquippedItems$(items: bigint[]) {
    return this._itemsApiService.equipItems(items);
  }
  getEquippedWeapon$() {
    return this.getEquippedItems$().pipe(
      map(items => items.find(item => item.type === 'weapon'))
    );
  }
  getArmorSum$() {
    return this.getEquippedItems$().pipe(
      map(items => {
        const armors = items.filter(item => item.type === 'armor');
        if (armors.length === 0) return 0;
        return armors
          .map(({ armor }) => (armor ? armor : 0))
          .reduce((a, b) => a + b);
      })
    );
  }
  getEquippedItems$() {
    return combineLatest([this.ownedItems$, this.playerCharacter$]).pipe(
      map(([items, pc]) =>
        items.filter(item => pc.equippedItems.includes(item.tokenId))
      ),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }
  getAvailableItems$() {
    return combineLatest([this.ownedItems$, this.playerCharacter$]).pipe(
      map(([items, pc]) =>
        items.filter(item => !pc.equippedItems.includes(item.tokenId))
      ),
      shareReplay(1)
    );
  }
}
