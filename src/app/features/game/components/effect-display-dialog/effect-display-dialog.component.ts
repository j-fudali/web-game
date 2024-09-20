import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Effect } from '../../../../shared/interfaces/effect';
import { PanelModule } from 'primeng/panel';
import { MessagesModule } from 'primeng/messages';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { StatisticEffectComponent } from '../statistic-effect/statistic-effect.component';
@Component({
  selector: 'jfudali-effect-display-dialog',
  standalone: true,
  imports: [
    CommonModule,
    PanelModule,
    MessagesModule,
    ButtonModule,
    StatisticEffectComponent
  ],
  templateUrl: './effect-display-dialog.component.html',
  styleUrl: './effect-display-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EffectDisplayDialogComponent {
  private dialogConfig = inject(DynamicDialogConfig)
  private dialogRef = inject(DynamicDialogRef)
  effect = this.dialogConfig.data.effect as Effect
  nextEncounter(){
    this.dialogRef.close(true)
  }
}
