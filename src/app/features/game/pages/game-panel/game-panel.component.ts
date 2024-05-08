import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PlayerService } from '../../../../shared/services/player.service';

@Component({
  selector: 'jfudali-game-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-panel.component.html',
  styleUrl: './game-panel.component.scss',
})
export class GamePanelComponent {
  private _playerService = inject(PlayerService);
  playerCharacter = this._playerService.playerCharacter;
}
