import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ListboxModule } from 'primeng/listbox';
import { Decision } from '../../../../shared/interfaces/decision';
@Component({
  selector: 'jfudali-encounter-decisions',
  standalone: true,
  imports: [CommonModule, ListboxModule],
  templateUrl: './encounter-decisions.component.html',
  styleUrl: './encounter-decisions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EncounterDecisionsComponent {
  decisions = input.required<Decision[]>();
  selectedDecision = output<Decision>();
}
