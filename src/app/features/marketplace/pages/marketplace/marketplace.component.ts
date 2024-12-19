import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { DataViewModule, DataViewPageEvent } from 'primeng/dataview';
import { DividerModule } from 'primeng/divider';
import { ItemsService } from '../../../../shared/services/items.service';
import { ItemComponent } from '../../../../shared/components/item/item.component';
import { ButtonModule } from 'primeng/button';
import { ItemInShopComponent } from '../../components/item-in-shop/item-in-shop.component';
import { TabViewModule } from 'primeng/tabview';
import { MarketplaceService } from '../../services/marketplace.service';
import { SkeletonModule } from 'primeng/skeleton';
import { ThirdwebService } from '../../../../shared/thirdweb/thirdweb.service';
import { AlreadyInSellPipe } from '../../pipes/already-in-sell.pipe';
import { SellData } from '../../interfaces/sell-data';
import { RouterModule } from '@angular/router';
import { MarketplaceItem } from '../../interfaces/marketplace-item';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { WalletService } from '../../../../shared/services/wallet.service';
import { SectionTitleComponent } from '../../../../shared/components/section-title/section-title.component';
@Component({
  selector: 'jfudali-marketplace',
  standalone: true,
  imports: [
    CommonModule,
    DataViewModule,
    DividerModule,
    ButtonModule,
    ItemInShopComponent,
    TabViewModule,
    SkeletonModule,
    RouterModule,
    SectionTitleComponent,
  ],
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.scss',
  providers: [MarketplaceService],
})
export class MarketplaceComponent implements OnInit {
  private _itemsService = inject(ItemsService);
  private _walletService = inject(WalletService);
  private _marketplaceService = inject(MarketplaceService);
  walletData = this._walletService.state.wallet;
  ownedItemsStatus = toSignal(
    merge(
      toObservable(this._itemsService.state.status),
      toObservable(this._marketplaceService.state.status)
    ),
    { initialValue: 'loading' }
  );
  ownedItems = this._itemsService.state.onwedItems;
  ownedItemsSize = computed(() => this.ownedItems().length);
  marketplaceStatus = this._marketplaceService.state.status;
  itemsToBuy = this._marketplaceService.state.items;
  userAddress = computed(() => this.walletData()?.account?.address!);
  ngOnInit(): void {
    this._itemsService.getOwnedItems$.next();
    this._marketplaceService.getListings$.next();
  }
  performAction(mode: 'sell' | 'buy', data: MarketplaceItem | SellData) {
    if (mode === 'sell') {
      this.sell(data as SellData);
    } else {
      this.buy(data as MarketplaceItem);
    }
  }
  buy(item: MarketplaceItem) {
    this._marketplaceService.buy$.next(item);
  }
  sell(sellData: SellData) {
    this._marketplaceService.sell$.next(sellData);
  }
}
