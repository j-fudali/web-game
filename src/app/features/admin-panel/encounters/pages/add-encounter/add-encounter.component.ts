import { CommonModule } from '@angular/common';
import { Component, computed, inject, Signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ScrollerOptions } from 'primeng/api';
import { ScrollerScrollIndexChangeEvent } from 'primeng/scroller';
import { EnemyDto } from '../../../../../shared/api/enemies/model/enemy.dto';
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
export class AddEncounterComponent {
  private addEncouterService = inject(AddEncounterService);
  status = this.addEncouterService.status;
  last = this.addEncouterService.last;
  page = this.addEncouterService.page;
  enemies = this.addEncouterService.enemies;
  form = EncounterFormGroupGenerator.getEncounterFormGroup();
  addEnemy = false;
  options: Signal<ScrollerOptions> = computed(() => ({
    showLoader: true,
    loading: this.status() === 'enemies-loading',
    lazy: true,
    onLazyLoad: this.loadEnemies.bind(this),
  }));
  submit() {
    if (this.form.valid) {
      const enemyId = (
        (this.form.get('enemy') as FormControl).value as EnemyDto
      ).id;
      console.log(enemyId);
      this.addEncouterService.createEncounter$.next({
        ...this.form.value,
        enemyId,
      });
      this.form.reset();
    }
  }
  toggleEnemy() {
    EncounterFormGroupGenerator.toggleEnemyFormControl(
      this.form,
      this.addEnemy
    );
  }
  loadEnemies() {
    const last = this.last();
    const page = this.page();
    if (page && last === false)
      this.addEncouterService.getEnemies$.next(page + 1);
  }
}
