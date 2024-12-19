import {
  AbstractControl,
  FormArray,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';

export function uniqueDecision(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const parent = control.parent as FormArray;
    const text = control.get('text')?.value as string;
    if (!parent || text === '') return null;
    return parent.controls.filter(c => (c.get('text')?.value as string) == text)
      .length > 1
      ? { notUnique: true }
      : null;
  };
}
