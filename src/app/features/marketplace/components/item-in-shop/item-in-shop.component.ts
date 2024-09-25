import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ItemTranslatePipe } from '../../../../shared/pipes/item-translate.pipe';
import { OwnedItem } from '../../../../shared/interfaces/owned-item';
import { ClassType } from '../../../../shared/enums/class-type.enum';
import { ItemType } from '../../../../shared/enums/item-type.enum';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'jfudali-item-in-shop',
  standalone: true,
  imports: [
    CommonModule,
    ItemTranslatePipe,
    ButtonModule
  ],
  templateUrl: './item-in-shop.component.html',
  styleUrl: './item-in-shop.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemInShopComponent {
  item = input.required<OwnedItem>()
  actionLabel = input.required<string>()
  onAction = output()
  itemType = ItemType
  classType = ClassType
}
