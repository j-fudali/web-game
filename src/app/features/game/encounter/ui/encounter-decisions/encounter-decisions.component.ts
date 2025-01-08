import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ListboxModule } from 'primeng/listbox';
import { DecisionDto } from '../../../../../shared/api/encounters/model/decision.dto';
@Component({
  selector: 'jfudali-encounter-decisions',
  standalone: true,
  imports: [CommonModule, ListboxModule],
  templateUrl: './encounter-decisions.component.html',
  styleUrl: './encounter-decisions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EncounterDecisionsComponent {
  disabled = input.required<boolean>();
  decisions = input.required<DecisionDto[]>();
  selectedDecision = output<DecisionDto>();
}
