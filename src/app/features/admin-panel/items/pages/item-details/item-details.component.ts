import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { SectionTitleComponent } from '../../../../../shared/components/section-title/section-title.component';
import { ItemFormComponent } from '../../ui/item-form/item-form.component';
import { FormControl, FormGroup } from '@angular/forms';
import { ItemsFormGroupGenerator } from '../../utils/items-form-group.generator';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, tap } from 'rxjs';
import { ItemType } from '../../../../../shared/enums/item-type.enum';
import { ItemDetailsService } from './services/item-details.service';
import { ButtonModule } from 'primeng/button';
import { UpdateItem } from 'app/shared/thirdweb/model/update-item.model';

@Component({
  selector: 'jfudali-item-details',
  standalone: true,
  imports: [SectionTitleComponent, ItemFormComponent, ButtonModule],
  providers: [ItemDetailsService],
  templateUrl: './item-details.component.html',
  styleUrl: './item-details.component.scss',
})
export class ItemDetailsComponent implements OnInit {
  private itemDetailsService = inject(ItemDetailsService);
  id = input.required<number>();
  item = this.itemDetailsService.item;
  status = this.itemDetailsService.status;
  form = ItemsFormGroupGenerator.getItemFormGroup();
  imageSrc: string | undefined;
  image: File | undefined;
  isArmor = toSignal(
    (this.form.get('type') as FormControl).valueChanges.pipe(
      tap(type =>
        type === ItemType.Armor ? this.attachArmor() : this.attachDamage()
      ),
      map(type => type === ItemType.Armor)
    ),
    { initialValue: false }
  );
  isSet = false;
  editMode = false;
  constructor() {
    effect(
      () => {
        if (!this.isSet) {
          const item = this.item();
          if (item) {
            this.form.patchValue(item);
            if (item.type === ItemType.Armor) {
              this.attachArmor();
            } else {
              this.attachDamage();
            }
            this.form.disable();
            this.imageSrc = item.image;
            this.isSet = true;
          }
        }
      },
      { allowSignalWrites: true }
    );
  }
  ngOnInit(): void {
    this.itemDetailsService.getItem$.next(this.id());
  }
  attachArmor() {
    ItemsFormGroupGenerator.attachArmorToFormGroup(this.form);
  }
  attachDamage() {
    ItemsFormGroupGenerator.attachDamageToFormGroup(this.form);
  }
  executeAction() {
    if (this.editMode) {
      this.submit();
    } else {
      this.editMode = true;
      this.form.enable();
    }
  }
  cancel() {
    this.editMode = false;
    this.form.disable();
  }
  submit() {
    if (this.form.valid) {
      const item = this.item();
      if (item) {
        const updateItem: UpdateItem = {
          ...item,
          ...this.form.value,
          oldImage: item.image,
        };
        if (this.image) updateItem.newImage = this.image;
        this.itemDetailsService.updateItem$.next({
          id: item.tokenId,
          updateItem: updateItem,
        });
      }
    }
  }
}
