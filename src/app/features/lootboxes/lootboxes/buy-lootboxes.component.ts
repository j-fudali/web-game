import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { BuyLootboxesService } from './services/buy-lootboxes.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { IpfsConverter } from '../../../shared/utils/ipfs-converter';
import { ImageModule } from 'primeng/image';
import { TagModule } from 'primeng/tag';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title.component';
import { RouterLink } from '@angular/router';
import { LootboxCardComponent } from '../ui/lootbox-card/lootbox-card.component';
import { ProgressBarModule } from 'primeng/progressbar';
@Component({
  selector: 'jfudali-buy-lootboxes',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    ImageModule,
    TagModule,
    SectionTitleComponent,
    RouterLink,
    LootboxCardComponent,
    ProgressBarModule,
  ],
  providers: [BuyLootboxesService],
  templateUrl: './buy-lootboxes.component.html',
  styleUrl: './buy-lootboxes.component.scss',
})
export class BuyLootboxesComponent {
  private _buyLootboxesService = inject(BuyLootboxesService);
  private lootbox = this._buyLootboxesService.lootbox;
  availablePacks = computed(() => this.lootbox()?.quantity.toLocaleString());
  item = computed(() => this.lootbox()?.asset.metadata);
  image = computed(() => {
    const item = this.item();
    return item && item.image
      ? IpfsConverter.convertIpfs(item.image)
      : undefined;
  });
  price = computed(
    () =>
      `${this.lootbox()?.currencyValuePerToken.displayValue} ${
        this.lootbox()?.currencyValuePerToken.symbol
      }`
  );
  quantity = computed(() => this.lootbox()?.quantity);

  status = this._buyLootboxesService.status;

  buyLootbox() {
    const lootbox = this.lootbox();
    if (lootbox)
      this._buyLootboxesService.buyLootbox$.next({
        //TODO
        listingId: 1n,
        price: lootbox.currencyValuePerToken.value,
      });
  }
}
