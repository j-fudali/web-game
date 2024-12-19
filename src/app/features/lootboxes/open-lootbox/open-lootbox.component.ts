import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { OpenLootboxService } from './services/open-lootbox.service';
import { CommonModule } from '@angular/common';
import { SectionTitleComponent } from '../../../shared/components/section-title/section-title.component';
import { LootboxCardComponent } from '../ui/lootbox-card/lootbox-card.component';
import { RouterLink } from '@angular/router';
import { IpfsConverter } from '../../../shared/utils/ipfs-converter';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';

@Component({
  selector: 'jfudali-open-lootbox',
  standalone: true,
  imports: [
    CommonModule,
    SectionTitleComponent,
    LootboxCardComponent,
    ButtonModule,
    RouterLink,
    ProgressBarModule,
  ],
  providers: [OpenLootboxService],
  templateUrl: './open-lootbox.component.html',
  styleUrl: './open-lootbox.component.scss',
})
export class OpenLootboxComponent {
  private _openLootboxService = inject(OpenLootboxService);
  userLootboxes = this._openLootboxService.userLootboxes;
  status = this._openLootboxService.status;
  availablePacks = computed(() =>
    this.userLootboxes()?.quantityOwned.toLocaleString()
  );
  image = computed(() => {
    const lootboxs = this.userLootboxes();
    return lootboxs && lootboxs.metadata.image
      ? IpfsConverter.convertIpfs(lootboxs.metadata.image)
      : undefined;
  });
  openLootbox() {
    this._openLootboxService.openLootbox$.next();
  }
}
