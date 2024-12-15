import { Component, inject } from '@angular/core';
import { SectionTitleComponent } from '../../../ui/section-title/section-title.component';
import { EnemyFormGroupGenerator } from '../../utils/enemy-form-group.generator';
import { EnemyFormComponent } from '../../ui/add-enemy/enemy-form.component';
import { ButtonModule } from 'primeng/button';
import { AddEnemyService } from './services/add-enemy.service';
import { NewEnemyDto } from '../../../../../shared/api/enemies/model/new-enemy.dto';

@Component({
  selector: 'jfudali-add-enemy',
  standalone: true,
  imports: [SectionTitleComponent, EnemyFormComponent, ButtonModule],
  providers: [AddEnemyService],
  templateUrl: './add-enemy.component.html',
  styleUrl: './add-enemy.component.scss',
})
export class AddEnemyComponent {
  private addEnemyService = inject(AddEnemyService);
  status = this.addEnemyService.state.status;
  form = EnemyFormGroupGenerator.getFormGroup();
  image: File;
  weaponImage: File;
  selectImage(image: File) {
    this.image = image;
  }
  selectWeaponImage(image: File) {
    this.weaponImage = image;
  }
  submit() {
    if (this.form.valid) {
      this.addEnemyService.addEnemy$.next({
        ...(this.form.value as NewEnemyDto),
        image: this.image,
        weaponImage: this.weaponImage,
      });
      this.form.reset();
    }
  }
}
