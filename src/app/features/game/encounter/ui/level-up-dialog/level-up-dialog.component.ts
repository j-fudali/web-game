import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TEXTS } from 'app/features/game/texts/texts.const';

@Component({
  selector: 'jfudali-level-up-dialog',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './level-up-dialog.component.html',
  styleUrl: './level-up-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LevelUpDialogComponent {
  readonly texts = TEXTS;
}
