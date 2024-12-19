import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { NFTMetadata } from 'thirdweb/dist/types/utils/nft/parseNft';

@Component({
  selector: 'jfudali-lootbox-card',
  standalone: true,
  imports: [CardModule, TagModule, ButtonModule],
  templateUrl: './lootbox-card.component.html',
  styleUrl: './lootbox-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LootboxCardComponent {
  onButtonClick = output<void>();
  item = input.required<NFTMetadata | undefined>();
  availablePacks = input.required<string | undefined>();
  image = input.required<string | undefined>();
  status = input.required<string | undefined>();
  price = input<string | undefined>();
  buttonLabel = input.required<string>();
}
