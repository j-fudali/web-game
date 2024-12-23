import { PAGE_SIZE } from './../../../shared/constants/config.const';
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BuyLootboxesService } from './services/buy-lootboxes.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { TagModule } from 'primeng/tag';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title.component';
import { RouterLink } from '@angular/router';
import { LootboxCardComponent } from '../ui/lootbox-card/lootbox-card.component';
import { ProgressBarModule } from 'primeng/progressbar';
import { DirectListing } from 'thirdweb/extensions/marketplace';
import { DataViewModule, DataViewPageEvent } from 'primeng/dataview';
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
    ProgressBarModule,
    DataViewModule,
    LootboxCardComponent,
  ],
  providers: [BuyLootboxesService],
  templateUrl: './buy-lootboxes.component.html',
  styleUrl: './buy-lootboxes.component.scss',
})
export class BuyLootboxesComponent {
  private _buyLootboxesService = inject(BuyLootboxesService);
  PAGE_SIZE = PAGE_SIZE;
  lootboxes = this._buyLootboxesService.lootboxes;
  totalRecords = this._buyLootboxesService.totalRecords;
  status = this._buyLootboxesService.status;

  buyLootbox(lootbox: DirectListing) {
    this._buyLootboxesService.buyLootbox$.next(lootbox);
  }
  changePage(e: DataViewPageEvent) {
    this._buyLootboxesService.getLootboxes$.next(e.first / e.rows);
  }
}
