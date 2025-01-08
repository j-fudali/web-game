import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { WalletAddressPipe } from '../../pipes/wallet-address.pipe';
import { WalletBalancePipe } from '../../pipes/wallet-balance.pipe';
import { METAMASK_ICON } from 'app/shared/constants/config.const';
import { ChipModule } from 'primeng/chip';
import { GetWalletBalanceResult } from 'thirdweb/dist/types/wallets/utils/getWalletBalance';

@Component({
  selector: 'jfudali-wallet-data-chip',
  standalone: true,
  imports: [
    CommonModule,
    ChipModule,
    AvatarModule,
    WalletAddressPipe,
    WalletBalancePipe,
  ],
  templateUrl: './wallet-data-chip.component.html',
  styleUrl: './wallet-data-chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletDataChipComponent {
  readonly metamaskIcon = METAMASK_ICON;
  accountAddress = input.required<string>();
  walletData = input.required<GetWalletBalanceResult | undefined>();
}
