import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldsetModule } from 'primeng/fieldset';
@Component({
  selector: 'jfudali-encounter-details',
  standalone: true,
  imports: [CommonModule, FieldsetModule],
  template: `
    <p-fieldset [legend]="title()">
      <p class="m-0">
        {{ description() }}
      </p>
      <ng-content></ng-content>
    </p-fieldset>
  `,
  styleUrl: './encounter-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EncounterDetailsComponent {
  title = input.required<string>();
  description = input.required<string>();
}
