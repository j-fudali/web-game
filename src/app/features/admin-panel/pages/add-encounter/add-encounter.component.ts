import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { SectionTitleComponent } from '../../ui/section-title/section-title.component';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { AddEncounterFormGroupGenerator } from './utils/add-encounter-form-group.generator';
import { AddEncounterService } from './services/add-encounter.service';
import { DecisionsFormArrayComponent } from './ui/decisions-form/decisions-form-array.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
@Component({
  selector: 'jfudali-add-encounter',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SectionTitleComponent,
    ButtonModule,
    DropdownModule,
    DividerModule,
    InputTextareaModule,
    InputNumberModule,
    InputTextModule,
    DecisionsFormArrayComponent,
  ],
  providers: [AddEncounterService],
  templateUrl: './add-encounter.component.html',
  styleUrl: './add-encounter.component.scss',
})
export class AddEncounterComponent {
  private addEncouterService = inject(AddEncounterService);
  status = this.addEncouterService.status;
  form = AddEncounterFormGroupGenerator.getAddEncounterFormGroup();
  addEnemy = false;

  get title(): FormControl {
    return this.form.get('title') as FormControl;
  }
  get description(): FormControl {
    return this.form.get('description') as FormControl;
  }
  get difficulty(): FormControl {
    return this.form.get('difficulty') as FormControl;
  }
  get decisions(): FormArray {
    return this.form.get('decisions') as FormArray<FormGroup>;
  }

  submit() {
    if (this.form.valid) {
      this.addEncouterService.createEncounter$.next(this.form.value);
      this.form.reset();
    }
  }
}
