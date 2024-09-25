import { CommonModule } from '@angular/common';
import {  Component, inject } from '@angular/core';
import { DataViewModule } from 'primeng/dataview';
import { DividerModule } from 'primeng/divider';
import { ItemsService } from '../../../../shared/services/items.service';
import { ItemComponent } from '../../../../shared/components/item/item.component';
import { ButtonModule } from 'primeng/button';
import { ItemInShopComponent } from '../../components/item-in-shop/item-in-shop.component';
import { TabViewModule } from 'primeng/tabview';
@Component({
  selector: 'jfudali-marketplace',
  standalone: true,
  imports: [
    CommonModule,
    DataViewModule,
    DividerModule,
    ItemComponent,
    ButtonModule,
    ItemInShopComponent,
    TabViewModule
  ],
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.scss',
})
export class MarketplaceComponent {
  private _itemsService = inject(ItemsService)
  items = this._itemsService.state.onwedItems
  buy(){

  }
  sell(){
    
  }
}
