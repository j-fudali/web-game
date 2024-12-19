import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'jfudali-sub-section-title',
  standalone: true,
  imports: [CommonModule, DividerModule],
  templateUrl: './sub-section-title.component.html',
  styleUrl: './sub-section-title.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubSectionTitleComponent {
  title = input.required<string>();
}
