import { computeMsgId } from '@angular/compiler';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ListingStatus } from 'thirdweb/dist/types/extensions/marketplace/types';
import { NFTMetadata } from 'thirdweb/dist/types/utils/nft/parseNft';

@Component({
  selector: 'jfudali-lootbox-card',
  standalone: true,
  imports: [TagModule, ButtonModule],
  templateUrl: './lootbox-card.component.html',
  styleUrl: './lootbox-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LootboxCardComponent {
  onButtonClick = output<void>();
  item = input.required<NFTMetadata | undefined>();
  availablePacks = input.required<string | undefined>();
  buttonLabel = input.required<string>();
  status = input<ListingStatus>();
  isActive = computed(() => this.status() && this.status() === 'ACTIVE');
}
