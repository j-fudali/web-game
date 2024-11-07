import { inject } from '@angular/core';
import { CanDeactivateFn, Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DialogService } from 'primeng/dynamicdialog';
import { ConnectWalletDialogComponent } from '../components/connect-wallet-dialog/connect-wallet-dialog.component';
import { defaultIfEmpty, filter, map, switchMap, take, tap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { StartComponent } from '../../features/home/pages/start/start.component';
import { WalletService } from '../services/wallet.service';
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.getToken() != null ? true : router.parseUrl('/login');
};

export const alreadyLoggedIn: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.getToken() != null ? router.parseUrl('/game') : true;
};
export const walletConnected: CanActivateFn = (route, state) => {
  const walletService = inject(WalletService);
  const authServuce = inject(AuthService);
  const status$ = toObservable(walletService.state.status);
  const router = inject(Router);
  return status$.pipe(
    filter(s => s !== 'loading'),
    map(status => {
      if (status === 'connected') {
        return true;
      }
      authServuce.signOut$.next();
      return router.parseUrl('/home');
    })
  );
};
export const forceWalletConnected: CanDeactivateFn<StartComponent> = () => {
  const walletService = inject(WalletService);
  const dialogService = inject(DialogService);
  const status$ = toObservable(walletService.state.status);
  if (walletService.state.status() === 'disconnected') {
    const ref = dialogService.open(ConnectWalletDialogComponent, {
      header: 'Połącz portfel',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      maximizable: false,
      closable: true,
    });
    return ref.onClose.pipe(
      filter(connecting => connecting === true),
      tap(() => walletService.connect$.next()),
      switchMap(() => status$),
      map(status => (status == 'connected' ? true : false)),
      take(1),
      defaultIfEmpty(false)
    );
  }
  return true;
};
