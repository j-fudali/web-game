import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { WalletDataState } from '../../../shared/services/thirdweb.service';
import { AvatarModule } from 'primeng/avatar';
@Component({
  selector: 'jfudali-connect-button',
  standalone: true,
  imports: [CommonModule, ButtonModule, ChipModule, AvatarModule],
  templateUrl: './connect-button.component.html',
  styleUrl: './connect-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectButtonComponent {
  onMetamaskConnect = output<void>();
  walletData = input.required<WalletDataState>();
  label = computed(
    () =>
      `${this.walletData()
        .data()
        ?.account.address.slice(0, 6)}...${this.walletData()
        .data()
        ?.account.address.slice(-4, -1)}`
  );
  balance = computed(
    () =>
      `${this.walletData().data()?.balance.displayValue} ${
        this.walletData().data()?.balance.symbol
      }`
  );
}
