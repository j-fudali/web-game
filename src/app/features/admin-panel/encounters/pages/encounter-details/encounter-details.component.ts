import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { EncounterDetailsService } from './services/encounter-details.service';
import { SectionTitleComponent } from '../../../../../shared/components/section-title/section-title.component';
import { EncounterFormComponent } from '../../features/encounter-form/encounter-form.component';
import { EncounterFormGroupGenerator } from '../../utils/encounter-form-group.generator';
import { FormArray } from '@angular/forms';
import {
  DecisionEncounter,
  EnemyEncounterDto,
} from '../../../../../shared/interfaces/encounter';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ConfirmationService } from 'primeng/api';
import { EncounterDto } from '../../../../../shared/api/encounters/model/encounter.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EnemiesDto } from 'app/shared/api/enemies/model/enemies.dto';

@Component({
  selector: 'jfudali-encounter-details',
  standalone: true,
  imports: [
    CommonModule,
    SectionTitleComponent,
    EncounterFormComponent,
    ProgressBarModule,
    ButtonModule,
    ConfirmPopupModule,
  ],
  templateUrl: './encounter-details.component.html',
  styleUrl: './encounter-details.component.scss',
  providers: [EncounterDetailsService],
})
export class EncounterDetailsComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private confirmationService = inject(ConfirmationService);
  private encounterDetailsService = inject(EncounterDetailsService);
  status = this.encounterDetailsService.status;
  form = EncounterFormGroupGenerator.getEncounterFormGroup();
  id = input.required<string>();
  encounter: EncounterDto;
  defaultEnemy: EnemiesDto;
  editMode = false;
  get decisions() {
    return this.form.get('decisions') as FormArray;
  }

  ngOnInit(): void {
    this.encounterDetailsService
      .getEncounterById$(this.id())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(encounter => {
        this.encounter = encounter;
        if (encounter.enemy)
          this.defaultEnemy = { id: this.id(), ...encounter.enemy };
        this.setInitialValues(encounter);
      });
  }
  executeAction() {
    if (this.editMode) {
      this.submit();
    } else {
      this.editMode = true;
      this.form.enable();
    }
  }
  deleteEncounter(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Czy napewno chcesz usunć wyzwanie?',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Anuluj',
      acceptLabel: 'Usuń',
      accept: () => {
        this.encounterDetailsService.deleteEncounter$.next(this.id());
      },
    });
  }
  cancel() {
    this.editMode = false;
    this.setInitialValues(this.encounter);
    this.form.disable();
  }
  submit() {
    this.encounterDetailsService.updateEncounter$.next({
      id: this.id(),
      data: this.form.value,
    });
    this.editMode = false;
    this.form.disable();
  }

  private setInitialValues(encounter: EncounterDto) {
    this.form.patchValue(encounter);
    if (this.encounter.enemy) {
      this.setInitialFormValuesWithEnemy(encounter as EnemyEncounterDto);
    } else {
      this.setInitialFormValuesWithDecisions(encounter as DecisionEncounter);
    }
    this.form.disable();
  }
  private setInitialFormValuesWithDecisions(encounter: DecisionEncounter) {
    EncounterFormGroupGenerator.toggleEnemyFormControl(this.form, false);
    const decisions = this.form.get('decisions') as FormArray;
    if (encounter.decisions && encounter.decisions.length > 0) {
      if (decisions.length > 0) decisions.clear();
      encounter.decisions.forEach(d => {
        this.decisions.push(
          EncounterFormGroupGenerator.getDecisionFormGroup(d)
        );
      });
    }
  }
  private setInitialFormValuesWithEnemy(encounter: EnemyEncounterDto) {
    EncounterFormGroupGenerator.toggleEnemyFormControl(this.form, true);
    this.form.get('enemyId')?.setValue(encounter.enemy.id);
  }
}
