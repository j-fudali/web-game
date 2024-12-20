import { Item } from './../../../../../shared/interfaces/item';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { SectionTitleComponent } from '../../../../../shared/components/section-title/section-title.component';
import { DataViewModule, DataViewPageEvent } from 'primeng/dataview';
import { RouterLink } from '@angular/router';
import { ItemsListService } from './services/items-list.service';
import { PAGE_SIZE } from '../../../../../shared/constants/config.const';
import { AvatarModule } from 'primeng/avatar';
import { ItemTranslatePipe } from '../../../../../shared/pipes/item-translate.pipe';
import { Texts } from '../../../texts/texts.const';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { BodySlotTranslatePipe } from '../../../../../shared/pipes/body-slot-translate.pipe';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { SubSectionTitleComponent } from '../../../../../shared/components/sub-section-title/sub-section-title.component';
import { TagModule } from 'primeng/tag';
@Component({
  selector: 'jfudali-items-list',
  standalone: true,
  imports: [
    CommonModule,
    SectionTitleComponent,
    DataViewModule,
    RouterLink,
    AvatarModule,
    ItemTranslatePipe,
    PaginatorModule,
    ButtonModule,
    BodySlotTranslatePipe,
    OverlayPanelModule,
    FormsModule,
    InputNumberModule,
    NgOptimizedImage,
    SubSectionTitleComponent,
    TagModule,
  ],
  providers: [ItemsListService],
  templateUrl: './items-list.component.html',
  styleUrl: './items-list.component.scss',
})
export class ItemsListComponent {
  private itemsListService = inject(ItemsListService);
  texts = Texts;
  rows = PAGE_SIZE;
  items = this.itemsListService.items;
  totalAmount = this.itemsListService.totalAmount;
  status = this.itemsListService.status;
  addToPackQuantity = 1;
  private _itemsSelectedWithQuantity = signal<
    { item: Item; quantity: number }[]
  >([]);
  itemsSelectedWithQuantity = this._itemsSelectedWithQuantity.asReadonly();
  itemsSelected = computed(() =>
    this._itemsSelectedWithQuantity().map(i => i.item)
  );

  changePage(e: DataViewPageEvent) {
    this.itemsListService.getItems$.next(e.first / e.rows);
  }
  addToPack(item: Item) {
    this._itemsSelectedWithQuantity.update(state => [
      ...state,
      { item, quantity: this.addToPackQuantity },
    ]);
    this.addToPackQuantity = 1;
  }
  removeItemFromSelected(item: { item: Item; quantity: number }) {
    this._itemsSelectedWithQuantity.update(state =>
      state.filter(i => i !== item)
    );
  }
  createPack() {
    this.itemsListService.createPack$.next(
      this.itemsSelectedWithQuantity().map(i => ({
        tokenId: i.item.tokenId,
        totalRewards: i.quantity,
      }))
    );
  }
}
