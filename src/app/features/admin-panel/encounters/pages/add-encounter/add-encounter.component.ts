import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { SectionTitleComponent } from '../../../../../shared/components/section-title/section-title.component';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { AddEncounterService } from './services/add-encounter.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { EncounterFormComponent } from '../../ui/encounter-form/encounter-form.component';
import { EncounterFormGroupGenerator } from '../../utils/encounter-form-group.generator';
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
    EncounterFormComponent,
  ],
  providers: [AddEncounterService],
  templateUrl: './add-encounter.component.html',
  styleUrl: './add-encounter.component.scss',
})
export class AddEncounterComponent {
  private addEncouterService = inject(AddEncounterService);
  status = this.addEncouterService.status;
  form = EncounterFormGroupGenerator.getEncounterFormGroup();

  submit() {
    if (this.form.valid) {
      this.addEncouterService.createEncounter$.next(this.form.value);
      this.form.reset();
    }
  }
}
