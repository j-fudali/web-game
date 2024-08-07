import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  input,
  model,
} from '@angular/core';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import {
  EnemyStatistics,
  Statistics,
} from '../../../../shared/interfaces/statistics';

@Component({
  selector: 'jfudali-statistics-panel',
  standalone: true,
  imports: [CommonModule, ToastModule, ProgressBarModule],
  templateUrl: './statistics-panel.component.html',
  styleUrl: './statistics-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsPanelComponent {
  statistics = model.required<Statistics | EnemyStatistics>();
  showEnergy = input.required<boolean>();
  energyLabel = computed(() => {
    const statistics = this.statistics();
    return this.isStatistics(statistics)
      ? 'Energia: ' +
          statistics.energy.actualValue +
          '/' +
          statistics.energy.maximumValue
      : undefined;
  });
  healthLabel = computed(
    () =>
      'Zdrowie: ' +
      this.statistics().health.actualValue +
      '/' +
      this.statistics().health.maximumValue
  );
  powerPointsLabel = computed(
    () =>
      'Punkty mocy: ' +
      this.statistics().powerPoints.actualValue +
      '/' +
      this.statistics().powerPoints.maximumValue
  );
  energyValue = computed(() => {
    const statistics = this.statistics();
    return this.isStatistics(statistics)
      ? (statistics.energy.actualValue / statistics.energy.maximumValue) * 100
      : undefined;
  });
  healthValue = computed(
    () =>
      (this.statistics().health.actualValue /
        this.statistics().health.maximumValue) *
      100
  );
  powerPointsValue = computed(
    () =>
      (this.statistics().powerPoints.actualValue /
        this.statistics().powerPoints.maximumValue) *
      100
  );
  private isStatistics(val: Statistics | EnemyStatistics): val is Statistics {
    return 'energy' in val;
  }
}
