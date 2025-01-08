import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { StatisticsPanelComponent } from '../../../features/game/ui/statistics-panel/statistics-panel.component';
import { PlayerCharacterDto } from '../../api/player-character/model/player-character.dto';
import { Enemy } from '../../interfaces/enemy';

@Component({
  selector: 'jfudali-character',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    StatisticsPanelComponent,
    NgOptimizedImage,
  ],
  template: `
    <div
      class="flex gap-2 h-full"
      [ngClass]="orientation() === 'vertical' ? 'flex-column' : 'flex-row'">
      <div
        class="overflow-hidden border-round relative "
        [ngClass]="orientation() === 'vertical' ? 'h-24rem md:h-16rem' : 'w-4'">
        <img [ngSrc]="character().image" fill priority />
      </div>
      <p-card class="flex-1" [header]="character().name">
        <ng-content></ng-content>
        <jfudali-statistics-panel
          [statistics]="character().statistics"
          [showEnergy]="showEnergy()"></jfudali-statistics-panel>
      </p-card>
    </div>
  `,
  styleUrl: './character.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterComponent {
  character = input.required<PlayerCharacterDto | Enemy>();
  orientation = input<'vertical' | 'horizontal'>('horizontal');
  showEnergy = input<boolean>(true);
}
