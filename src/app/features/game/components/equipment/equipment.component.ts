import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  input,
  model,
  output,
} from '@angular/core';
import { DragDropModule } from 'primeng/dragdrop';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { MenuItem } from 'primeng/api';
import { ItemComponent } from '../../../../shared/components/item/item.component';
import { OwnedItem } from '../../../../shared/interfaces/owned-item';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
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
    ItemComponent,
    ProgressSpinnerModule,
  ],
  templateUrl: './equipment.component.html',
  styleUrl: './equipment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EquipmentComponent {
  @ViewChild('cm') cm: ContextMenu | undefined;
  unequipOnDrop = output<void>();
  onCmEquipItem = output<void>();
  avaliableItems = input.required<OwnedItem[]>();
  draggedItem = model.required<OwnedItem | null>();
  equippedItems = input.required<OwnedItem[]>();
  status = input.required<'completed' | 'loading'>();
  orientation = input.required<'vertical' | 'horizontal'>();
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
  onDragStart(item: OwnedItem) {
    this.draggedItem.set(item);
  }
  onDragEnd() {
    this.draggedItem.set(null);
  }
  drop() {
    if (
      this.draggedItem() &&
      !this.avaliableItems().includes(this.draggedItem()!)
    ) {
      this.unequipOnDrop.emit();
    }
    this.draggedItem.set(null);
  }
}
