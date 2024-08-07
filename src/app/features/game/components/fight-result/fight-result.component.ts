import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';

@Component({
  selector: 'jfudali-fight-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fight-result.component.html',
  styleUrl: './fight-result.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FightResultComponent {
  private dynamicDialogConfig = inject(DynamicDialogConfig);
  winnerName = this.dynamicDialogConfig.data['winnerName'] as string;
  //Potential reward
  // reward = this.dynamicDialogConfig.data['reward'] as Reward | undefined;
}
