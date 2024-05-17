import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { PlayerService } from '../../../../shared/services/player.service';
import { PlayerCharacterComponent } from '../../components/player-character/player-character.component';
import { EquipmentComponent } from '../../components/equipment/equipment.component';
import { ItemsSlotsComponent } from '../../components/items-slots/items-slots.component';

@Component({
  selector: 'jfudali-game-panel',
  standalone: true,
  imports: [
    CommonModule,
    PlayerCharacterComponent,
    EquipmentComponent,
    ItemsSlotsComponent,
  ],
  templateUrl: './game-panel.component.html',
  styleUrl: './game-panel.component.scss',
})
export class GamePanelComponent {
  private _playerService = inject(PlayerService);
  playerCharacter = this._playerService.playerCharacter;
  avaliableItems = signal<
    {
      name: string;
      type: 'weapon' | 'armor';
      bodySlot?: 'head' | 'chest' | 'arms' | 'legs';
    }[]
  >([
    { name: 'Młot', type: 'weapon' },
    { name: 'Hełm', type: 'armor', bodySlot: 'head' },
    { name: 'Hełm 2', type: 'armor', bodySlot: 'head' },
    { name: 'Naramienniki', type: 'armor', bodySlot: 'arms' },
    { name: 'Naramienniki 2', type: 'armor', bodySlot: 'arms' },
  ]);
  equippedItems = signal([]);
  draggedItem: {
    name: string;
    type: 'weapon' | 'armor';
    bodySlot?: string;
  } | null = null;
}
