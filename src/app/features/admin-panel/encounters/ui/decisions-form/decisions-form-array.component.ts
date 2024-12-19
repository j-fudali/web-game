import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  forwardRef,
  input,
} from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { DividerModule } from 'primeng/divider';
import { EffectFormGroupComponent } from '../effect-form-group/effect-form-group.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { EncounterFormGroupGenerator } from '../../utils/encounter-form-group.generator';
import { SubSectionTitleComponent } from '../../../../../shared/components/sub-section-title/sub-section-title.component';

@Component({
  selector: 'jfudali-decisions-form',
  standalone: true,
  imports: [
    CommonModule,
    DividerModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    EffectFormGroupComponent,
    SubSectionTitleComponent,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => DecisionsFormArrayComponent),
    },
  ],
  templateUrl: './decisions-form-array.component.html',
  styleUrl: './decisions-form-array.component.scss',
})
export class DecisionsFormArrayComponent {
  formArray =
    input<
      FormArray<FormGroup<{ text: FormControl<string>; effect: FormGroup }>>
    >();

  addDecisionFormGroup() {
    this.formArray()?.insert(
      0,
      EncounterFormGroupGenerator.getDecisionFormGroup()
    );
  }
  removeDecision(index: number) {
    this.formArray()?.removeAt(index);
  }
}
