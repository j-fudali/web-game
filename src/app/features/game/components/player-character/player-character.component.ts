import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { StatisticsPanelComponent } from '../statistics-panel/statistics-panel.component';
import { PlayerCharacter } from '../../../../shared/interfaces/player-character';

@Component({
  selector: 'jfudali-player-character',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    StatisticsPanelComponent,
    NgOptimizedImage,
  ],
  templateUrl: './player-character.component.html',
  styleUrl: './player-character.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerCharacterComponent {
  playerCharacter = input.required<PlayerCharacter>();
}
