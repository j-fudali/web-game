import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ItemComponent } from '../../../../../shared/components/item/item.component';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ItemMapper } from '../../../../../shared/utils/item-mapper';
import { NFT } from 'thirdweb';
import { SubSectionTitleComponent } from '../../../../../shared/components/sub-section-title/sub-section-title.component';
import { Texts } from '../../../texts/texts.const';

@Component({
  selector: 'jfudali-reward',
  standalone: true,
  imports: [ItemComponent, SubSectionTitleComponent],
  templateUrl: './reward.component.html',
  styleUrl: './reward.component.scss',
})
export class RewardComponent {
  private dialogConfig = inject(DynamicDialogConfig);
  nft = this.dialogConfig.data.nft as NFT;
  item = ItemMapper.convertNftToItem(this.nft);
  texts = Texts;
}
