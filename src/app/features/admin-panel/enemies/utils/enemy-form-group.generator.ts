import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UpdateEnemyDto } from '../../../../shared/api/enemies/model/update-enemy.dto';

export class EnemyFormGroupGenerator {
  public static getFormGroup(
    initialData?: Exclude<UpdateEnemyDto, ['image, weaponImage']>
  ) {
    const group = new FormGroup({
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      description: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(750)],
      }),
      level: new FormControl(1, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.min(1),
          Validators.max(20),
        ],
      }),
      maxHealth: new FormControl(1, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)],
      }),
      maxPowerPoints: new FormControl(1, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)],
      }),
      weaponName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      damage: new FormControl(1, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)],
      }),
      armor: new FormControl(0, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0)],
      }),
    });
    if (initialData) group.patchValue(initialData);
    return group;
  }
}
