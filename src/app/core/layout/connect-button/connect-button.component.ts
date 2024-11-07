import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  computed,
  input,
  output,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { AvatarModule } from 'primeng/avatar';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { metamaskIcon } from '../../../shared/constants/config.constants';
import { WalletDataState } from '../../../shared/services/wallet.service';
@Component({
  selector: 'jfudali-connect-button',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    ChipModule,
    AvatarModule,
    OverlayPanelModule,
    MenuModule,
  ],
  templateUrl: './connect-button.component.html',
  styleUrl: './connect-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectButtonComponent {
  @ViewChild('op') overlayPanel: OverlayPanel | undefined;
  metamaskIcon = metamaskIcon;
  onMetamaskConnect = output<void>();
  onDisconnectWallet = output<void>();
  walletData = input.required<WalletDataState>();
  label = computed(
    () =>
      `${this.walletData()
        .wallet()
        ?.account.address.slice(0, 6)}...${this.walletData()
        .wallet()
        ?.account.address.slice(-4, -1)}`
  );
  balance = computed(() => {
    const balance =
      Math.round(
        Number(this.walletData().wallet()?.balance.displayValue) * 100
      ) / 100;
    return `${balance} ${this.walletData().wallet()?.balance.symbol}`;
  });
  walletActions: MenuItem[] = [
    {
      label: 'Rozłącz',
      icon: 'pi pi-sign-out',
      command: () => {
        this.onDisconnectWallet.emit();
        if (this.overlayPanel) {
          this.overlayPanel.hide();
        }
      },
    },
  ];
}
