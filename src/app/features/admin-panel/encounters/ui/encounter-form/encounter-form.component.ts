import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { DecisionsFormArrayComponent } from '../../pages/add-encounter/ui/decisions-form/decisions-form-array.component';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';
import { InputTextarea, InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { NewEncounterDto } from '../../../../../shared/api/encounters/model/new-encounter.dto';
import { Encounter } from '../../../../../shared/interfaces/encounter';

@Component({
  selector: 'jfudali-encounter-form',
  standalone: true,
  imports: [
    CommonModule,
    DecisionsFormArrayComponent,
    ReactiveFormsModule,
    InputNumberModule,
    DropdownModule,
    DividerModule,
    InputTextareaModule,
    InputTextModule,
  ],
  templateUrl: './encounter-form.component.html',
  styleUrl: './encounter-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EncounterFormComponent {
  form = input.required<FormGroup>();
  addEnemy = false;

  get title(): FormControl {
    return this.form().get('title') as FormControl;
  }
  get description(): FormControl {
    return this.form().get('description') as FormControl;
  }
  get difficulty(): FormControl {
    return this.form().get('difficulty') as FormControl;
  }
  get decisions(): FormArray {
    return this.form().get('decisions') as FormArray<FormGroup>;
  }
}
