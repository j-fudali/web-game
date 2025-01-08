import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  HostListener,
  computed,
  inject,
} from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { PlayerCharacterComponent } from '../ui/player-character/player-character.component';
import { EquipmentComponent } from '../ui/equipment/equipment.component';
import { ItemsSlotsComponent } from '../ui/items-slots/items-slots.component';
import { GamePanelService } from './services/game-panel.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { OwnedItem } from 'app/shared/interfaces/owned-item';
import { TEXTS } from '../texts/texts.const';
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
  providers: [GamePanelService],
  templateUrl: './game-panel.component.html',
  styleUrl: './game-panel.component.scss',
})
export class GamePanelComponent {
  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth > 992) {
      this.equipmentOrientation = 'vertical';
    } else {
      this.equipmentOrientation = 'horizontal';
    }
  }
  equipmentOrientation: 'vertical' | 'horizontal' =
    window.innerWidth > 922 ? 'vertical' : 'horizontal';

  private destroyRef = inject(DestroyRef);
  private _gamepanelService = inject(GamePanelService);
  readonly texts = TEXTS;
  isResting = toSignal(this._gamepanelService.getIsResting$(), {
    initialValue: this._gamepanelService.getIsResting(),
  });
  playerCharacter = toSignal(this._gamepanelService.getPlayerCharacter$());
  avaliableItems = toSignal(this._gamepanelService.getAvailableItems$(), {
    initialValue: [],
  });
  equippedItems = toSignal(this._gamepanelService.getEquippedItems$(), {
    initialValue: [],
  });
  draggedItem: OwnedItem | null = null;
  disabledRest = computed(
    () =>
      this.playerCharacter()?.statistics?.health?.actualValue ===
        this.playerCharacter()?.statistics?.health?.maximumValue &&
      this.playerCharacter()?.statistics?.energy?.actualValue ===
        this.playerCharacter()?.statistics?.energy?.maximumValue
  );

  rest() {
    this._gamepanelService
      .rest$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
  stopRest() {
    this._gamepanelService.stopRest();
  }
  equip() {
    if (this.draggedItem) this._gamepanelService.equip(this.draggedItem);
  }
  unequip() {
    if (this.draggedItem) this._gamepanelService.unequip(this.draggedItem);
  }

  replaceItem(item: OwnedItem) {
    if (this.draggedItem)
      this._gamepanelService.replaceItem(item, this.draggedItem);
  }
}
