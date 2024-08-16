import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BadgeModule } from 'primeng/badge';
@Component({
  selector: 'jfudali-statistic-effect',
  standalone: true,
  imports: [
    CommonModule,
    BadgeModule
  ],
  templateUrl: './statistic-effect.component.html',
  styleUrl: './statistic-effect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticEffectComponent {
  type = input.required<'health' | 'gold'>();
  value = input.required<number>()
  image = computed(() => this.type() === 'health' ? '/assets/heart.png' : '/assets/coin.png')
}
