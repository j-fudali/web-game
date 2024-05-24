import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { metamaskIcon } from '../../constants/config.constants';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { DividerModule } from 'primeng/divider';
@Component({
  selector: 'jfudali-connect-wallet-dialog',
  standalone: true,
  imports: [CommonModule, AvatarModule, ButtonModule, DividerModule],
  templateUrl: './connect-wallet-dialog.component.html',
  styleUrl: './connect-wallet-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectWalletDialogComponent {
  ref = inject(DynamicDialogRef);
  metamaskIcon = metamaskIcon;
}
