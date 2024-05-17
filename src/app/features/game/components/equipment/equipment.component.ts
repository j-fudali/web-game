import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  model,
  output,
} from '@angular/core';
import { DragDropModule } from 'primeng/dragdrop';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { Item } from '../../../../shared/interfaces/item';
import { MenuItem } from 'primeng/api';
@Component({
  selector: 'jfudali-equipment',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    DragDropModule,
    CardModule,
    CarouselModule,
    ContextMenuModule,
  ],
  templateUrl: './equipment.component.html',
  styleUrl: './equipment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EquipmentComponent {
  @ViewChild('cm') cm: ContextMenu | undefined;
  onCmEquipItem = output<void>();
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
      label: 'Załóż',
      icon: 'pi pi-plus',
      command: () => {
        this.onCmEquipItem.emit();
      },
    },
  ];
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
    if (
      this.draggedItem &&
      !this.avaliableItems().find((i) => i == this.draggedItem())
    ) {
      this.equippedItems.update((eq) =>
        eq.filter((e) => e != this.draggedItem())
      );
      this.avaliableItems.update((eq) => [...eq, this.draggedItem()!]);
    }
    this.draggedItem.set(null);
  }
}
