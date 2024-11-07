import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  output,
} from '@angular/core';
import { ToolbarModule } from 'primeng/toolbar';
import { ConnectButtonComponent } from '../connect-button/connect-button.component';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { WalletDataState } from '../../../shared/services/wallet.service';
@Component({
  selector: 'jfudali-header',
  standalone: true,
  imports: [
    CommonModule,
    ToolbarModule,
    NgOptimizedImage,
    MenubarModule,
    ConnectButtonComponent,
    ButtonModule,
    ButtonGroupModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  onSignOut = output<void>();
  onConnectMetamask = output<void>();
  onDisconnectWallet = output<void>();
  walletData = input.required<WalletDataState>();
  navigationsList = input.required<MenuItem[]>();
  sidebarVisible = model<boolean>();
}
