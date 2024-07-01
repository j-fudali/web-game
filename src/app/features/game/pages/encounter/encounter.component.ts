import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PlayerCharacterComponent } from '../../components/player-character/player-character.component';
import { ItemsSlotsComponent } from '../../components/items-slots/items-slots.component';
import { PlayerCharacterService } from '../../../../shared/services/player-character.service';

@Component({
  selector: 'jfudali-encounter',
  standalone: true,
  imports: [CommonModule, PlayerCharacterComponent, ItemsSlotsComponent],
  templateUrl: './encounter.component.html',
  styleUrl: './encounter.component.scss',
})
export class EncounterComponent {
  private _playerCharacterService = inject(PlayerCharacterService);
  playerCharacter = this._playerCharacterService.state.playerCharacter;
}
