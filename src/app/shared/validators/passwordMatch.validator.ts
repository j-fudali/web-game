import { AbstractControl, ValidatorFn } from '@angular/forms';

export function passwordMatch(group: AbstractControl) {
  const password = group.get('password')?.value;
  const rePassword = group.get('rePassword')?.value;
  return password === rePassword ? null : { notSame: true };
}
