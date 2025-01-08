import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { healthOrGoldAmountNotNull } from '../pages/add-encounter/validators/healthOrGoldAmountNotNull';
import { uniqueDecision } from './unique-decision.validator';
import { DecisionDto } from 'app/shared/api/encounters';

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
    });
  }
  public static toggleEnemyFormControl(
    group: FormGroup,
    isEnemyToSet: boolean
  ) {
    if (isEnemyToSet) {
      if (group.contains('decisions')) group.removeControl('decisions');
      group.addControl('enemyId', new FormControl(null, [Validators.required]));
    } else {
      if (group.contains('enemyId')) group.removeControl('enemyId');
      group.addControl(
        'decisions',
        new FormArray(
          [this.getDecisionFormGroup(), this.getDecisionFormGroup()],
          { validators: [Validators.required, Validators.minLength(2)] }
        )
      );
    }
  }
  public static getDecisionFormGroup(decision?: DecisionDto): FormGroup {
    const group = new FormGroup(
      {
        text: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required],
        }),
        effect: this.getEffectFormGroup(),
      },
      [uniqueDecision()]
    );
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
