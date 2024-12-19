import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { healthOrGoldAmountNotNull } from '../pages/add-encounter/validators/healthOrGoldAmountNotNull';
import { Decision } from '../../../../shared/interfaces/decision';
import { EnemyDto } from '../../../../shared/api/enemies/model/enemy.dto';

export class EncounterFormGroupGenerator {
  public static getEncounterFormGroup(): FormGroup {
    return new FormGroup({
      title: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      description: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      difficulty: new FormControl(1, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.min(1),
          Validators.max(20),
        ],
      }),
      decisions: new FormArray(
        [
          EncounterFormGroupGenerator.getDecisionFormGroup(),
          EncounterFormGroupGenerator.getDecisionFormGroup(),
        ],
        [Validators.required, Validators.minLength(2)]
      ),
    });
  }
  public static toggleEnemyFormControl(
    group: FormGroup,
    isEnemyToSet: boolean
  ) {
    if (isEnemyToSet) {
      group.removeControl('decisions');
      group.addControl(
        'enemy',
        new FormControl<EnemyDto | undefined>(undefined, [Validators.required])
      );
    } else {
      group.removeControl('enemy');
      group.addControl(
        'decisions',
        new FormControl([
          this.getDecisionFormGroup(),
          this.getDecisionFormGroup(),
        ])
      );
    }
  }
  public static getDecisionFormGroup(decision?: Decision): FormGroup {
    const group = new FormGroup({
      text: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      effect: this.getEffectFormGroup(),
    });
    if (decision) group.patchValue(decision);
    return group;
  }
  private static getEffectFormGroup(): FormGroup {
    return new FormGroup(
      {
        text: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required],
        }),
        healthAmount: new FormControl(null),
        goldAmount: new FormControl(null, Validators.min(1)),
      },
      { validators: [healthOrGoldAmountNotNull(), Validators.minLength(2)] }
    );
  }
}
