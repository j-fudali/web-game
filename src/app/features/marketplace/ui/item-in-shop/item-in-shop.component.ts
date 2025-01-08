import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  viewChild,
} from '@angular/core';
import { ItemTranslatePipe } from '../../../../shared/pipes/item-translate.pipe';
import { ItemType } from '../../../../shared/enums/item-type.enum';
import { ButtonModule } from 'primeng/button';
import { MarketplaceItem } from '../../interfaces/marketplace-item';
import { TooltipModule } from 'primeng/tooltip';
import { BodySlotTranslatePipe } from '../../../../shared/pipes/body-slot-translate.pipe';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { SellData } from '../../interfaces/sell-data';
import { WalletData } from '../../../../shared/interfaces/wallet-data';
import { AlreadyInSellPipe } from '../../pipes/already-in-sell.pipe';
import { OwnedItem } from '../../../../shared/interfaces/owned-item';
import { BadgeModule } from 'primeng/badge';
import { GetBalanceResult } from 'thirdweb/extensions/erc20';
@Component({
  selector: 'jfudali-item-in-shop',
  standalone: true,
  imports: [
    CommonModule,
    ItemTranslatePipe,
    BodySlotTranslatePipe,
    ButtonModule,
    TooltipModule,
    OverlayPanelModule,
    InputNumberModule,
    FormsModule,
    BadgeModule,
  ],
  templateUrl: './item-in-shop.component.html',
  styleUrl: './item-in-shop.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemInShopComponent {
  sellPanel = viewChild.required<OverlayPanel>('sellOp');
  buyPanel = viewChild.required<OverlayPanel>('buyOp');
  balance = input<GetBalanceResult>();
  userAddress = input.required<string>();
  mode = input.required<'sell' | 'buy'>();
  item = input.required<MarketplaceItem | OwnedItem>();
  quantity = computed(() =>
    (this.item() as OwnedItem).quantity
      ? 'x' + (this.item() as OwnedItem).quantity.toLocaleString()
      : undefined
  );
  itemsToBuy = input.required<MarketplaceItem[]>();
  label = computed(() =>
    this.mode() === 'buy'
      ? (this.item() as MarketplaceItem).balance.displayValue +
        ' ' +
        (this.item() as MarketplaceItem).balance.symbol
      : this.actionLabel()
  );
  disabledAction = computed(() => {
    if (this.mode() === 'buy') {
      if (
        (this.item() as MarketplaceItem).creatorAddress === this.userAddress()
      ) {
        return 'Nie możesz kupić własnego przedmiotu';
      }
      if (
        Number(this.balance()?.displayValue) <
        Number((this.item() as MarketplaceItem).balance.displayValue)
      ) {
        return 'Nie masz wystaraczająco środków';
      }
    }
    if (this.mode() === 'sell') {
      if (
        new AlreadyInSellPipe().transform(
          this.itemsToBuy(),
          this.item() as OwnedItem,
          this.userAddress()
        )
      ) {
        return 'Przedmiot został już wystawiony na sprzedaż';
      }
    }
    return null;
  });
  actionLabel = input.required<string>();
  onAction = output<MarketplaceItem | SellData>();
  itemType = ItemType;
  showSellOverlay = false;
  sellPrice = 0.0;
  performAction(e: Event) {
    if (this.mode() === 'sell') {
      this.sellPanel().show(e);
    } else {
      this.buyPanel().show(e);
    }
  }
  sell() {
    this.onAction.emit({
      item: this.item() as OwnedItem,
      price: this.sellPrice,
    });
    this.sellPanel().hide();
  }
  buy() {
    this.onAction.emit(this.item() as MarketplaceItem);
    this.buyPanel().hide();
  }
}
