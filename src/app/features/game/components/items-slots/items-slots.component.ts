import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  computed,
  model,
  output,
} from '@angular/core';
import { MenuItem } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { DragDropModule } from 'primeng/dragdrop';

@Component({
  selector: 'jfudali-items-slots',
  standalone: true,
  imports: [CommonModule, CardModule, DragDropModule, ContextMenuModule],
  templateUrl: './items-slots.component.html',
  styleUrl: './items-slots.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemsSlotsComponent {
  @ViewChild('cm') cm: ContextMenu | undefined;
  onUnequip = output<void>();
  avaliableItems =
    model.required<
      { name: string; type: 'weapon' | 'armor'; bodySlot?: string }[]
    >();
  draggedItem = model.required<{
    name: string;
    type: 'weapon' | 'armor';
    bodySlot?: string;
  } | null>();
  equippedItems =
    model.required<
      { name: string; type: 'weapon' | 'armor'; bodySlot?: string }[]
    >();
  actions: MenuItem[] = [
    {
      label: 'Zdejmij',
      icon: 'pi pi-minus',
      command: () => {
        this.onUnequip.emit();
      },
    },
  ];
  headItem = computed(() =>
    this.equippedItems().find((i) => i.type == 'armor' && i.bodySlot == 'head')
  );
  chestItem = computed(() =>
    this.equippedItems().find((i) => i.type == 'armor' && i.bodySlot == 'chest')
  );
  armsItem = computed(() =>
    this.equippedItems().find((i) => i.type == 'armor' && i.bodySlot == 'arms')
  );
  legsItem = computed(() =>
    this.equippedItems().find((i) => i.type == 'armor' && i.bodySlot == 'legs')
  );
  weapon = computed(() => this.equippedItems().find((i) => i.type == 'weapon'));
  onContextMenu(event: MouseEvent, item: any) {
    this.draggedItem.set(item);
    this.cm?.show(event);
  }
  onHide() {
    this.draggedItem.set(null);
  }
  onDragStart(item: {
    name: string;
    type: 'weapon' | 'armor';
    bodySlot?: string;
  }) {
    this.draggedItem.set(item);
  }
  onDragEnd() {
    this.draggedItem.set(null);
  }
  drop() {
    if (!this.draggedItem()) return;
    if (!this.avaliableItems().find((i) => i == this.draggedItem())) return;
    const itemAlreadySet = this.equippedItems().find(
      (i) =>
        i.type == this.draggedItem()?.type &&
        (this.draggedItem()?.bodySlot
          ? i.bodySlot == this.draggedItem()?.bodySlot
          : true)
    );
    if (itemAlreadySet) {
      const replacedItem =
        this.equippedItems()[this.equippedItems().indexOf(itemAlreadySet)];
      this.avaliableItems.update((items) => [replacedItem, ...items]);
      this.equippedItems.update((items) => {
        const newItems = [
          ...items.filter((i) => i != replacedItem),
          this.draggedItem()!,
        ];
        return newItems;
      });
    } else {
      this.equippedItems.update((eq) => [...eq, this.draggedItem()!]);
    }
    this.avaliableItems.update((eq) =>
      eq.filter((e) => e != this.draggedItem())
    );
    this.draggedItem.set(null);
  }
}
