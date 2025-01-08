import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { TEXTS } from '../../texts/texts.const';

@Component({
  selector: 'jfudali-get-rest-dialog',
  standalone: true,
  imports: [CommonModule, ButtonModule, NgOptimizedImage],
  templateUrl: './get-rest-dialog.component.html',
  styleUrl: './get-rest-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetRestDialogComponent {
  readonly texts = TEXTS;
}
