import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { SectionTitleComponent } from '../../../ui/section-title/section-title.component';
import { ItemFormComponent } from '../../ui/item-form/item-form.component';
import { ButtonModule } from 'primeng/button';
import { ItemsFormGroupGenerator } from '../../utils/items-form-group.generator';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { map, tap } from 'rxjs';
import { ItemType } from '../../../../../shared/enums/item-type.enum';
import { AddItemService } from './services/add-item.service';
import { NewItem } from '../../../../../shared/thirdweb/model/new-item.model';

@Component({
  selector: 'jfudali-add-item',
  standalone: true,
  imports: [SectionTitleComponent, ItemFormComponent, ButtonModule],
  providers: [AddItemService],
  templateUrl: './add-item.component.html',
  styleUrl: './add-item.component.scss',
})
export class AddItemComponent {
  private addItemService = inject(AddItemService);
  private itemForm = viewChild.required<ItemFormComponent>('itemForm');
  status = this.addItemService.status;
  form = ItemsFormGroupGenerator.getItemFormGroup();
  image: File | undefined;
  imageSrc: string | undefined;
  isArmor = toSignal(
    (this.form.get('type') as FormControl).valueChanges.pipe(
      tap(type =>
        type === ItemType.Armor ? this.attachArmor() : this.attachDamage()
      ),
      map(type => type === ItemType.Armor)
    ),
    { initialValue: false }
  );
  constructor() {
    effect(
      () => {
        if (this.status() === 'success') {
          this.image = undefined;
          this.imageSrc = undefined;
          this.attachDamage();
          this.itemForm().clear();
          this.form.reset();
        }
      },
      { allowSignalWrites: true }
    );
  }
  attachArmor() {
    ItemsFormGroupGenerator.attachArmorToFormGroup(this.form);
  }
  attachDamage() {
    ItemsFormGroupGenerator.attachDamageToFormGroup(this.form);
  }
  submit() {
    if (this.form.valid && this.image) {
      this.addItemService.addItem$.next({
        ...(this.form.value as NewItem),
        image: this.image,
      });
    }
  }
}
