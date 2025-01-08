import { EnemyFormGroupGenerator } from './../../utils/enemy-form-group.generator';
import { Component, inject, input, effect, OnInit } from '@angular/core';
import { SectionTitleComponent } from '../../../../../shared/components/section-title/section-title.component';
import { EnemyFormComponent } from '../../ui/enemy-form/enemy-form.component';
import { ButtonModule } from 'primeng/button';
import { EnemyDetailsService } from './services/enemy-details.service';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ProgressBarModule } from 'primeng/progressbar';
import { ConfirmationService } from 'primeng/api';
import { UpdateEnemyDto } from '../../../../../shared/api/enemies/model/update-enemy.dto';

@Component({
  selector: 'jfudali-enemy-details',
  standalone: true,
  imports: [
    SectionTitleComponent,
    EnemyFormComponent,
    ButtonModule,
    ConfirmPopupModule,
    ProgressBarModule,
  ],
  providers: [EnemyDetailsService],
  templateUrl: './enemy-details.component.html',
  styleUrl: './enemy-details.component.scss',
})
export class EnemyDetailsComponent implements OnInit {
  private confirmationService = inject(ConfirmationService);
  private enemyDetailsService = inject(EnemyDetailsService);
  private enemy = this.enemyDetailsService.enemy;
  id = input.required<string>();
  status = this.enemyDetailsService.status;
  form = EnemyFormGroupGenerator.getFormGroup();
  initialImage: string;
  initialWeaponImage: string;
  image: File;
  weaponImage: File;
  editMode = false;
  isFormInit = false;
  constructor() {
    effect(() => {
      if (!this.isFormInit) {
        const enemy = this.enemy();
        if (enemy) {
          this.form.patchValue(enemy);
          this.form.get('weaponName')?.setValue(enemy.weapon.name);
          this.form.get('damage')?.setValue(enemy.weapon.damage);
          this.initialImage = enemy.image;
          this.initialWeaponImage = enemy.weapon.image;
          this.isFormInit = true;
        }
      }
    });
  }
  ngOnInit(): void {
    this.enemyDetailsService.getEnemy$.next(this.id());
    this.form.disable();
  }
  executeAction() {
    if (this.editMode) {
      this.submit();
    } else {
      this.editMode = true;
      this.form.enable();
    }
  }
  cancel() {
    this.editMode = false;
    this.form.disable();
  }
  deleteEnemy(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Czy napewno chcesz usunć przeciwnika?',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Anuluj',
      acceptLabel: 'Usuń',
      accept: () => {
        this.enemyDetailsService.deleteEnemy$.next(this.id());
      },
    });
  }
  selectImage(image: File) {
    this.image = image;
  }
  selectWeaponImage(image: File) {
    this.weaponImage = image;
  }
  submit() {
    if (this.form.valid) {
      this.editMode = false;
      this.enemyDetailsService.updateEnemy$.next({
        id: this.id(),
        data: {
          ...this.form.value,
          image: this.image,
          weaponImage: this.weaponImage,
        } as UpdateEnemyDto,
      });
    }
  }
}
