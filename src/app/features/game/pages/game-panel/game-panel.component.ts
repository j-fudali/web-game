import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, effect, inject } from '@angular/core';
import { PlayerCharacterComponent } from '../../components/player-character/player-character.component';
import { EquipmentComponent } from '../../components/equipment/equipment.component';
import { ItemsSlotsComponent } from '../../components/items-slots/items-slots.component';
import { ItemsService } from '../../../../shared/services/items.service';
import { OwnedItem } from '../../../../shared/interfaces/owned-item';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PlayerCharacterService } from '../../../../shared/services/player-character.service';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'jfudali-game-panel',
  standalone: true,
  imports: [
    CommonModule,
    PlayerCharacterComponent,
    EquipmentComponent,
    ItemsSlotsComponent,
    ToastModule,
    ButtonModule,
    RouterModule,
  ],
  templateUrl: './game-panel.component.html',
  styleUrl: './game-panel.component.scss',
})
export class GamePanelComponent {
  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    if (window.innerWidth > 992) {
      this.equipmentOrientation = 'vertical';
    } else {
      this.equipmentOrientation = 'horizontal';
    }
  }
  equipmentOrientation: 'vertical' | 'horizontal' =
    window.innerWidth > 922 ? 'vertical' : 'horizontal';
  private _itemsService = inject(ItemsService);
  private _playerService = inject(PlayerCharacterService);
  private _messageService = inject(MessageService);
  playerCharacter = this._playerService.state.playerCharacter;
  equipmentSaveStatus = this._itemsService.state.equipmentSaveStatus;
  avaliableItems = this._itemsService.state.avaliableItems;
  equippedItems = this._itemsService.state.equippedItems;
  status = this._itemsService.state.status;
  draggedItem: OwnedItem | null = null;

  constructor() {
    effect(() => {
      if (this.equipmentSaveStatus()) {
        this._messageService.add({
          severity:
            this.equipmentSaveStatus()?.status == 'saved' ? 'success' : 'error',
          summary:
            this.equipmentSaveStatus()?.status == 'saved'
              ? 'Zapisano'
              : 'Nie zapisano',
          detail: `Zmiana ${
            this.equipmentSaveStatus()?.status == 'saved' ? '' : 'nie'
          } została zapisana`,
        });
      }
    });
  }
  equip() {
    if (this.draggedItem) this._playerService.equipItem$.next(this.draggedItem);
  }
  unequip() {
    if (this.draggedItem)
      this._playerService.unequipItem$.next(this.draggedItem);
  }

  replaceItem(item: OwnedItem) {
    this._playerService.unequipItem$.next(item);
    if (this.draggedItem) this._playerService.equipItem$.next(this.draggedItem);
  }
}
