import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { SectionTitleComponent } from '../../../../../shared/components/section-title/section-title.component';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { AddEncounterService } from './services/add-encounter.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { EncounterFormComponent } from '../../features/encounter-form/encounter-form.component';
import { EncounterFormGroupGenerator } from '../../utils/encounter-form-group.generator';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { EnemyEncounterDto } from 'app/shared/interfaces/encounter';
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
    ToggleButtonModule,
    FormsModule,
  ],
  providers: [AddEncounterService],
  templateUrl: './add-encounter.component.html',
  styleUrl: './add-encounter.component.scss',
})
export class AddEncounterComponent implements OnInit {
  private addEncouterService = inject(AddEncounterService);
  status = this.addEncouterService.status;
  form = EncounterFormGroupGenerator.getEncounterFormGroup();
  addEnemy = false;
  ngOnInit(): void {
    EncounterFormGroupGenerator.toggleEnemyFormControl(
      this.form,
      this.addEnemy
    );
  }
  submit() {
    if (this.form.valid) {
      this.addEncouterService.createEncounter$.next(this.form.getRawValue());
      this.form.reset();
    }
  }
  toggleEnemy() {
    EncounterFormGroupGenerator.toggleEnemyFormControl(
      this.form,
      this.addEnemy
    );
  }
}
