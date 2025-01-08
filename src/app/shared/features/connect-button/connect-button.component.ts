import { CommonModule } from '@angular/common';
import { Component, DestroyRef, ViewChild, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { AvatarModule } from 'primeng/avatar';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { METAMASK_ICON } from '../../../shared/constants/config.const';
import { ConnectButtonService } from './services/connect-button.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { TEXTS } from '../texts/texts.const';
import { WalletDataChipComponent } from './ui/wallet-data-chip/wallet-data-chip.component';
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
    WalletDataChipComponent,
  ],
  providers: [ConnectButtonService],
  templateUrl: './connect-button.component.html',
  styleUrl: './connect-button.component.scss',
})
export class ConnectButtonComponent {
  @ViewChild('op') overlayPanel: OverlayPanel | undefined;
  private _connectButtonService = inject(ConnectButtonService);
  private destroyRef = inject(DestroyRef);
  readonly texts = TEXTS;
  metamaskIcon = METAMASK_ICON;
  isDisconnected = toSignal(this._connectButtonService.isDisconnected$(), {
    initialValue: this._connectButtonService.isDisconnected(),
  });
  walletData = toSignal(this._connectButtonService.getWalletBalance$());
  accountAddress = toSignal(this._connectButtonService.getAccountAddress$(), {
    initialValue: '',
  });
  walletActions: MenuItem[] = [
    {
      label: TEXTS.CONNECT_BUTTON_DISCONNECT,
      icon: 'pi pi-sign-out',
      command: () => {
        this.disconnect();
        if (this.overlayPanel) {
          this.overlayPanel.hide();
        }
      },
    },
  ];
  loading = false;

  connect() {
    this.loading = true;
    this._connectButtonService
      .connect$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => (this.loading = false));
  }
  disconnect() {
    this.loading = true;
    this._connectButtonService
      .disconnect$()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => (this.loading = false));
  }
}
