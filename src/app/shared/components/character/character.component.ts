import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { StatisticsPanelComponent } from '../../../features/game/components/statistics-panel/statistics-panel.component';
import { PlayerCharacter } from '../../interfaces/player-character';
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
      [ngClass]="orientation() === 'vertical' ? 'flex-column' : 'flex-row'"
    >
      <div
        class="overflow-hidden border-round relative "
        [ngClass]="orientation() === 'vertical' ? 'h-16rem' : 'w-4'"
      >
        <img [ngSrc]="character().image" fill priority />
      </div>
      <p-card class="flex-1" [header]="character().name">
        <h3 class="m-0">Poziom: {{ character().level }}</h3>
        <ng-content></ng-content>
        <jfudali-statistics-panel
          [statistics]="character().statistics"
          [showEnergy]="showEnergy()"
        ></jfudali-statistics-panel>
      </p-card>
    </div>
  `,
  styleUrl: './character.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CharacterComponent {
  character = input.required<PlayerCharacter | Enemy>();
  orientation = input<'vertical' | 'horizontal'>('horizontal');
  showEnergy = input<boolean>(true);
}
