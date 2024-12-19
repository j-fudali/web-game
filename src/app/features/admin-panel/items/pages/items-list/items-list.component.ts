import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SectionTitleComponent } from '../../../../../shared/components/section-title/section-title.component';
import { DataViewModule } from 'primeng/dataview';
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
  status = this.itemsListService.status;
  page = 0;
  addToPackQuantity = 1;
  prevPage() {
    if (this.page > 0) {
      this.page = this.page - 1;
      this.itemsListService.getItems$.next(this.page);
    }
  }
  nextPage() {
    const items = this.items();
    if (items && items.length > 0) {
      this.page = this.page + 1;
      this.itemsListService.getItems$.next(this.page);
    }
  }
  addToPack(tokenId: bigint) {
    this.itemsListService.addToPack$.next({
      tokenId,
      quantity: BigInt(this.addToPackQuantity),
    });
  }
}
