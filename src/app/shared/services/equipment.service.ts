import { Injectable, Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, merge, debounceTime, switchMap, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { PlayerCharacter } from '../interfaces/player-character';
import { HttpClient } from '@angular/common/http';
import { PlayerCharacterService } from './player-character.service';
import { OwnedItem } from '../interfaces/owned-item';
import { ItemsService, ItemsState } from './items.service';

export interface EquipmentState{
  avaliableItems: Signal<OwnedItem[]>;
  equippedItems: Signal<OwnedItem[]>;
  status: Signal<{ status: 'saved' | 'notSaved' } | undefined>;
} 

@Injectable()
export class EquipmentService {
  private http = inject(HttpClient);
  private _playerService = inject(PlayerCharacterService);
  private _itemsService = inject(ItemsService)
  private ownedItems = this._itemsService.state.onwedItems
  private equippedItems = computed(() =>
    this.ownedItems().filter((item) =>
      this._playerService.state
        .playerCharacter()
        ?.equippedItems.includes(item.tokenId)
    )
  );
  private availableItems = computed(() => {
    return this.ownedItems().filter(
      (item) =>
        !this._playerService.state
          .playerCharacter()
          ?.equippedItems.includes(item.tokenId)
    );
  });
  //Saving equipment state
  private setEquippedItems = (items: bigint[]) =>
    this.http.put<Pick<PlayerCharacter, 'equippedItems'>>(
      environment.url + '/player-character/equipped-items',
      {
        equippedItems: items.map((i) => i.toString()),
      }
    );
  private equipmentSaveStatus$: Observable<{ status: 'saved' | 'notSaved' }> =
    merge(
      this._playerService.equipItem$,
      this._playerService.unequipItem$
    ).pipe(
      debounceTime(3000),
      switchMap(() =>
        this.setEquippedItems(this.equippedItems().map((i) => i.tokenId))
      ),
      map(() => ({ status: 'saved' } as { status: 'saved' | 'notSaved' })),
      catchError(() =>
        of({
          status: 'notSaved',
        } as { status: 'saved' | 'notSaved' })
      )
    );
  private equipmentSaveStatus = toSignal(this.equipmentSaveStatus$, {
    initialValue: undefined,
  });
  state: EquipmentState = {
    avaliableItems: this.availableItems,
    equippedItems: this.equippedItems,
    status:  this.equipmentSaveStatus,
  };
}
