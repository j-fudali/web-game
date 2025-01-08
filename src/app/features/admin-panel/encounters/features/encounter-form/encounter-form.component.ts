import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  Signal,
} from '@angular/core';
import { DecisionsFormArrayComponent } from '../../ui/decisions-form/decisions-form-array.component';
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
import { AvatarModule } from 'primeng/avatar';
import { ScrollerOptions } from 'primeng/api';
import { EncounterFormService } from './services/encounter-form.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { EnemyDto } from 'app/shared/api/enemies';
import { EnemiesDto } from 'app/shared/api/enemies/model/enemies.dto';

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
    ProgressSpinnerModule,
  ],
  providers: [EncounterFormService],
  templateUrl: './encounter-form.component.html',
  styleUrl: './encounter-form.component.scss',
})
export class EncounterFormComponent {
  private encounterFormService = inject(EncounterFormService);
  last = this.encounterFormService.last;
  page = this.encounterFormService.page;
  status = this.encounterFormService.status;
  defaultEnemy = input<EnemiesDto>();
  enemies = computed(() =>
    this.defaultEnemy()
      ? [this.defaultEnemy(), ...this.encounterFormService.enemies()]
      : this.encounterFormService.enemies()
  );
  form = input.required<FormGroup>();
  addEnemy = input.required<boolean | undefined>();
  options: Signal<ScrollerOptions> = computed(() => ({
    showLoader: true,
    loading: this.status() === 'enemies-loading',
    lazy: true,
    onLazyLoad: this.loadEnemies.bind(this),
  }));
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

  loadEnemies() {
    const last = this.last();
    const page = this.page();
    if (page && last === false)
      this.encounterFormService.getEnemies$.next(page + 1);
  }
}
