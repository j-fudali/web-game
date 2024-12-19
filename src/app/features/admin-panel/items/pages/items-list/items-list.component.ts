import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { SectionTitleComponent } from '../../../../../shared/components/section-title/section-title.component';
import {
  DataViewLazyLoadEvent,
  DataViewModule,
  DataViewPageEvent,
} from 'primeng/dataview';
import { RouterLink } from '@angular/router';
import { ItemsListService } from './services/items-list.service';
import { PAGE_SIZE } from '../../../../../shared/constants/config.const';
import { AvatarModule } from 'primeng/avatar';
import { ItemTranslatePipe } from '../../../../../shared/pipes/item-translate.pipe';
import { Texts } from '../../../texts/texts.const';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { every } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { BodySlotTranslatePipe } from '../../../../../shared/pipes/body-slot-translate.pipe';
import { ThirdwebService } from '../../../../../shared/thirdweb/thirdweb.service';

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
}
