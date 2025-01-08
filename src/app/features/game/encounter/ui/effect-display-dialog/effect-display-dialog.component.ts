import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { EffectDto } from '../../../../../shared/api/encounters/model/effect.dto';
import { PanelModule } from 'primeng/panel';
import { MessagesModule } from 'primeng/messages';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { StatisticEffectComponent } from './ui/statistic-effect/statistic-effect.component';
import { TEXTS } from '../../../texts/texts.const';
@Component({
  selector: 'jfudali-effect-display-dialog',
  standalone: true,
  imports: [
    CommonModule,
    PanelModule,
    MessagesModule,
    ButtonModule,
    StatisticEffectComponent,
  ],
  templateUrl: './effect-display-dialog.component.html',
  styleUrl: './effect-display-dialog.component.scss',
})
export class EffectDisplayDialogComponent {
  private dialogConfig = inject(DynamicDialogConfig);
  private dialogRef = inject(DynamicDialogRef);
  effect = this.dialogConfig.data.effect as EffectDto;
  readonly texts = TEXTS;

  nextEncounter() {
    this.dialogRef.close(true);
  }
  backToPanel() {
    this.dialogRef.close(false);
  }
}
