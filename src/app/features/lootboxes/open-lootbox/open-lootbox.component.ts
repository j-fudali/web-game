import { Component, inject } from '@angular/core';
import { OpenLootboxService } from './services/open-lootbox.service';
import { CommonModule } from '@angular/common';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title.component';
import { LootboxCardComponent } from '../ui/lootbox-card/lootbox-card.component';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { DataViewModule } from 'primeng/dataview';

@Component({
  selector: 'jfudali-open-lootbox',
  standalone: true,
  imports: [
    CommonModule,
    SectionTitleComponent,
    ButtonModule,
    RouterLink,
    ProgressBarModule,
    DataViewModule,
    LootboxCardComponent,
  ],
  providers: [OpenLootboxService],
  templateUrl: './open-lootbox.component.html',
  styleUrl: './open-lootbox.component.scss',
})
export class OpenLootboxComponent {
  private _openLootboxService = inject(OpenLootboxService);
  userLootboxes = this._openLootboxService.userLootboxes;
  status = this._openLootboxService.status;
  reward = this._openLootboxService.reward;
  openLootbox(packId: bigint) {
    this._openLootboxService.openLootbox$.next(packId);
  }
}
