import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ClassType } from '../../../../shared/enums/class-type.enum';
import { ItemType } from '../../../../shared/enums/item-type.enum';
import { Item } from '../../../../shared/interfaces/item';
import { BodySlot } from '../../../../shared/enums/body-slot.enum';

export class ItemsFormGroupGenerator {
  public static getItemFormGroup(): FormGroup {
    return new FormGroup({
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      description: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      classType: new FormControl(ClassType.Any, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      type: new FormControl(ItemType.Weapon, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      damage: new FormControl(1, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)],
      }),
    });
  }
  public static attachArmorToFormGroup(group: FormGroup) {
    group.removeControl('damage');
    group.addControl(
      'armor',
      new FormControl(0, {
        nonNullable: true,
        validators: [Validators.required],
      })
    );
    group.addControl(
      'bodySlot',
      new FormControl(BodySlot.Head, {
        nonNullable: true,
        validators: [Validators.required],
      })
    );
  }
  public static attachDamageToFormGroup(group: FormGroup) {
    group.removeControl('armor');
    group.removeControl('bodySlot');
    group.addControl(
      'damage',
      new FormControl(1, [Validators.required, Validators.min(1)])
    );
  }
  public static getPackMetadataFormGroup() {
    return new FormGroup({
      name: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      price: new FormControl(0, Validators.required),
    });
  }
}
