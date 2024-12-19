import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { DecisionsFormArrayComponent } from '../decisions-form/decisions-form-array.component';
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
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { SubSectionTitleComponent } from '../../../../../shared/components/sub-section-title/sub-section-title.component';
import { EnemyDto } from '../../../../../shared/api/enemies/model/enemy.dto';
import { AvatarModule } from 'primeng/avatar';
import { ScrollerOptions } from 'primeng/api';

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
    SubSectionTitleComponent,
    AvatarModule,
  ],
  templateUrl: './encounter-form.component.html',
  styleUrl: './encounter-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EncounterFormComponent {
  form = input.required<FormGroup>();
  addEnemy = input<boolean>(false);
  enemies = input<EnemyDto[]>();
  loading = input<boolean>();
  onScroll = output<void>();
  options = input<ScrollerOptions>();
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
  get enemy(): FormControl {
    return this.form().get('enemy') as FormControl;
  }
}
