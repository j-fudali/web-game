import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  computed,
  input,
  model,
  output,
} from '@angular/core';
import { MenuItem } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { DragDropModule } from 'primeng/dragdrop';
import { OwnedItem } from '../../../../shared/interfaces/owned-item';
import { ItemComponent } from '../../../../shared/components/item/item.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TEXTS } from '../../texts/texts.const';
@Component({
  selector: 'jfudali-items-slots',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    DragDropModule,
    ContextMenuModule,
    ItemComponent,
    ProgressSpinnerModule,
  ],
  templateUrl: './items-slots.component.html',
  styleUrl: './items-slots.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsSlotsComponent {
  @ViewChild('cm') cm: ContextMenu | undefined;
  readonly texts = TEXTS;
  equippedItems = input.required<OwnedItem[]>();
  equipOnDrop = output<void>();
  onCmUnequip = output<void>();
  replaceOnDrop = output<OwnedItem>();
  avaliableItems = input<OwnedItem[]>();
  draggedItem = model<OwnedItem | null>();
  actions: MenuItem[] = [
    {
      label: 'Zdejmij',
      icon: 'pi pi-minus',
      command: () => {
        this.onCmUnequip.emit();
      },
    },
  ];
  headItem = computed(() =>
    this.equippedItems().find(i => i.type == 'armor' && i.bodySlot == 'head')
  );
  chestItem = computed(() =>
    this.equippedItems().find(i => i.type == 'armor' && i.bodySlot == 'chest')
  );
  armsItem = computed(() =>
    this.equippedItems().find(i => i.type == 'armor' && i.bodySlot == 'arms')
  );
  legsItem = computed(() =>
    this.equippedItems().find(i => i.type == 'armor' && i.bodySlot == 'legs')
  );
  weapon = computed(() => this.equippedItems().find(i => i.type == 'weapon'));
  onContextMenu(event: MouseEvent, item: any) {
    this.draggedItem.set(item);
    this.cm?.show(event);
  }
  onHide() {
    this.draggedItem.set(null);
  }
  onDragStart(item: OwnedItem) {
    this.draggedItem.set(item);
  }
  onDragEnd() {
    this.draggedItem.set(null);
  }
  drop() {
    if (!this.draggedItem()) return;
    if (!this.avaliableItems()?.find(i => i == this.draggedItem())) return;
    const itemAlreadySet = this.equippedItems().find(
      i =>
        i.type == this.draggedItem()?.type &&
        (this.draggedItem()?.bodySlot
          ? i.bodySlot == this.draggedItem()?.bodySlot
          : true)
    );
    if (itemAlreadySet) {
      const replacedItem =
        this.equippedItems()[this.equippedItems().indexOf(itemAlreadySet)];
      this.replaceOnDrop.emit(replacedItem);
    } else {
      this.equipOnDrop.emit();
    }
    this.draggedItem.set(null);
  }
}
