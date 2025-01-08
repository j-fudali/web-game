import { CommonModule } from '@angular/common';
import { Component, DestroyRef, computed, inject } from '@angular/core';
import { DataViewModule } from 'primeng/dataview';
import { DividerModule } from 'primeng/divider';
import { ButtonModule } from 'primeng/button';
import { ItemInShopComponent } from './ui/item-in-shop/item-in-shop.component';
import { TabViewModule } from 'primeng/tabview';
import { MarketplaceService } from './services/marketplace.service';
import { SkeletonModule } from 'primeng/skeleton';
import { SellData } from './interfaces/sell-data';
import { RouterModule } from '@angular/router';
import { MarketplaceItem } from './interfaces/marketplace-item';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { SectionTitleComponent } from '../../shared/components/section-title/section-title.component';
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
export class MarketplaceComponent {
  private destroyRef = inject(DestroyRef);
  private _marketplaceService = inject(MarketplaceService);
  ownedItems = toSignal(this._marketplaceService.getOwnedItems$(), {
    initialValue: [],
  });
  ownedItemsSize = computed(() => this.ownedItems().length);
  itemsToBuy = toSignal(this._marketplaceService.getMarketplaceItems$(), {
    initialValue: [],
  });
  userAddress = toSignal(this._marketplaceService.getAccountAddress$(), {
    initialValue: '',
  });
  balance = toSignal(this._marketplaceService.getWalletBalance$());
  performAction(mode: 'sell' | 'buy', data: MarketplaceItem | SellData) {
    if (mode === 'sell') {
      this.sell(data as SellData);
    } else {
      this.buy(data as MarketplaceItem);
    }
  }
  buy(item: MarketplaceItem) {
    this._marketplaceService
      .buy$(item)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
  sell(sellData: SellData) {
    this._marketplaceService
      .sell$(sellData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}
