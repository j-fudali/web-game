import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
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
import { AddEncounterFormGroupGenerator } from '../../utils/add-encounter-form-group.generator';
import { EffectFormGroupComponent } from '../effect-form-group/effect-form-group.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DecisionsFormArrayComponent {
  formArray =
    input.required<
      FormArray<FormGroup<{ text: FormControl<string>; effect: FormGroup }>>
    >();

  addDecisionFormGroup() {
    this.formArray().insert(
      0,
      AddEncounterFormGroupGenerator.getDecisionFormGroup()
    );
  }
  removeDecision(index: number) {
    this.formArray().removeAt(index);
  }
}
