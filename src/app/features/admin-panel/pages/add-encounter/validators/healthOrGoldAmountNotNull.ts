import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function healthOrGoldAmountNotNull(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const health = control.get('healthAmount')?.value;
    const gold = control.get('goldAmount')?.value;
    return health || gold ? null : { bothNull: true };
  };
}
