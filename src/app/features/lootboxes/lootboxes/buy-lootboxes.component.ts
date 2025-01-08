import { PAGE_SIZE } from './../../../shared/constants/config.const';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { BuyLootboxesService } from './services/buy-lootboxes.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { TagModule } from 'primeng/tag';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title.component';
import { Router, RouterLink } from '@angular/router';
import { LootboxCardComponent } from '../ui/lootbox-card/lootbox-card.component';
import { ProgressBarModule } from 'primeng/progressbar';
import { DirectListing } from 'thirdweb/extensions/marketplace';
import { DataViewModule, DataViewPageEvent } from 'primeng/dataview';
import { TEXTS } from '../texts/texts.const';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { map, tap } from 'rxjs';
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
  private router = inject(Router);
  private _buyLootboxesService = inject(BuyLootboxesService);
  private destroyRef = inject(DestroyRef);
  PAGE_SIZE = PAGE_SIZE;
  lootboxes = toSignal(this._buyLootboxesService.getLootboxes$(), {
    initialValue: [],
  });
  totalRecords = toSignal(
    this._buyLootboxesService.getTotalRecords$().pipe(map(val => Number(val))),
    {
      initialValue: 0,
    }
  );
  readonly texts = TEXTS;
  buyLootbox(lootbox: DirectListing) {
    this._buyLootboxesService
      .buyLootbox$(lootbox)
      .pipe(
        tap(() => this.router.navigate(['/lootboxes/my-lootboxes'])),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }
  changePage(e: DataViewPageEvent) {
    this._buyLootboxesService.pageLootboxes$.next(e.first / e.rows);
  }
}
