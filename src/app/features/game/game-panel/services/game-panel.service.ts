import { inject, Injectable } from '@angular/core';
import { PlayerCharacterDto } from 'app/shared/api/player-character';
import { OwnedItem } from 'app/shared/interfaces/owned-item';
import { PlayerCharacterService } from 'app/features/game/services/player-character.service';
import { debounceTime, Observable, Subject, switchMap } from 'rxjs';
import { EquipmentService } from '../../services/equipment.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable()
export class GamePanelService {
  private _playerCharacterService = inject(PlayerCharacterService);
  private _equipmentService = inject(EquipmentService);
  private equipmentChanged$ = new Subject<void>();
  constructor() {
    this.equipmentChanged$
      .pipe(
        debounceTime(2000),
        switchMap(() =>
          this._equipmentService.saveEquippedItems$(
            this._playerCharacterService.getPlayerCharacter().equippedItems
          )
        ),
        takeUntilDestroyed()
      )
      .subscribe();
  }

  getIsResting$(): Observable<boolean> {
    return this._playerCharacterService.getIsResting$();
  }
  getIsResting(): boolean {
    return this._playerCharacterService.getIsResting();
  }
  getPlayerCharacter$(): Observable<PlayerCharacterDto> {
    return this._playerCharacterService.getPlayerCharacter$();
  }
  getAvailableItems$(): Observable<OwnedItem[]> {
    return this._equipmentService.getAvailableItems$();
  }
  getEquippedItems$(): Observable<OwnedItem[]> {
    return this._equipmentService.getEquippedItems$();
  }
  rest$(): Observable<void> {
    return this._playerCharacterService.rest();
  }
  stopRest(): void {
    return this._playerCharacterService.stopRest();
  }
  equip(item: OwnedItem) {
    this.equipmentChanged$.next();
    return this._playerCharacterService.equipItem(item);
  }
  unequip(item: OwnedItem) {
    this.equipmentChanged$.next();
    return this._playerCharacterService.unequipItem(item);
  }
  replaceItem(item: OwnedItem, newItem: OwnedItem) {
    this.equipmentChanged$.next();
    this._playerCharacterService.unequipItem(item);
    this._playerCharacterService.equipItem(newItem);
  }
}
