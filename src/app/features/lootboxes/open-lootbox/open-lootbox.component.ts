import { toSignal } from '@angular/core/rxjs-interop';
import { Component, inject } from '@angular/core';
import { OpenLootboxService } from './services/open-lootbox.service';
import { CommonModule } from '@angular/common';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title.component';
import { LootboxCardComponent } from '../ui/lootbox-card/lootbox-card.component';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { DataViewModule } from 'primeng/dataview';
import { TEXTS } from '../texts/texts.const';

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
  readonly texts = TEXTS;
  userLootboxes = toSignal(this._openLootboxService.getUserLootboxes$(), {
    initialValue: [],
  });
  reward = toSignal(this._openLootboxService.getReward$());
  openLootbox(packId: bigint) {
    this._openLootboxService.openLootbox$.next(packId);
  }
}
