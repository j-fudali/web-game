import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { healthOrGoldAmountNotNull } from '../validators/healthOrGoldAmountNotNull';

export class AddEncounterFormGroupGenerator {
  public static getAddEncounterFormGroup(): FormGroup {
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
          AddEncounterFormGroupGenerator.getDecisionFormGroup(),
          AddEncounterFormGroupGenerator.getDecisionFormGroup(),
        ],
        [Validators.required, Validators.minLength(2)]
      ),
    });
  }
  public static getDecisionFormGroup(): FormGroup {
    return new FormGroup({
      text: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      effect: this.getEffectFormGroup(),
    });
  }
  private static getEffectFormGroup(): FormGroup {
    return new FormGroup(
      {
        text: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required],
        }),
        healthAmount: new FormControl(null),
        goldAmount: new FormControl(null),
      },
      { validators: [healthOrGoldAmountNotNull(), Validators.minLength(2)] }
    );
  }
}
