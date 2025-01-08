import { inject } from '@angular/core';
import { CanDeactivateFn, Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DialogService } from 'primeng/dynamicdialog';
import { ConnectWalletDialogComponent } from '../components/connect-wallet-dialog/connect-wallet-dialog.component';
import { defaultIfEmpty, filter, map, of, switchMap, take } from 'rxjs';
import { StartComponent } from '../../features/start/start.component';
import { ThirdwebService } from '../thirdweb/thirdweb.service';
import { TEXTS } from './texts/texts.const';
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.getIsLoggedIn() ? true : router.parseUrl('/login');
};

export const alreadyLoggedIn: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.getIsLoggedIn() ? router.parseUrl('/game') : true;
};
export const walletConnected: CanActivateFn = (route, state) => {
  const thirdwebService = inject(ThirdwebService);
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!thirdwebService.getIsDisconnected()) {
    return true;
  }
  authService.signOut();
  return router.parseUrl('/home');
};
export const forceWalletConnected: CanDeactivateFn<StartComponent> = () => {
  const thirdwebService = inject(ThirdwebService);
  const dialogService = inject(DialogService);
  return thirdwebService.getIsDisconnected$().pipe(
    switchMap(isDisconnected => {
      if (isDisconnected) {
        const ref = dialogService.open(ConnectWalletDialogComponent, {
          header: TEXTS.CONNECT_WALLET,
          contentStyle: { overflow: 'auto' },
          baseZIndex: 10000,
          maximizable: false,
          closable: true,
        });
        return ref.onClose.pipe(
          filter(connecting => connecting === true),
          switchMap(() => thirdwebService.connect()),
          take(1),
          map(res => !!res),
          defaultIfEmpty(false)
        );
      }
      return of(true);
    })
  );
};
