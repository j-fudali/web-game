import { Routes } from '@angular/router';
import {
  alreadyLoggedIn,
  authGuard,
  forceWalletConnected,
  walletConnected,
} from './shared/guards/auth.guard';
import { PlayerCharacterService } from './shared/services/player-character.service';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/pages/start/start.component').then(
        (c) => c.StartComponent
      ),
    canActivate: [alreadyLoggedIn],
    canDeactivate: [forceWalletConnected],
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./core/auth/pages/sign-up/sign-up.component').then(
        (c) => c.SignUpComponent
      ),
    canActivate: [alreadyLoggedIn, walletConnected],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./core/auth/pages/login/login.component').then(
        (c) => c.LoginComponent
      ),
    canActivate: [alreadyLoggedIn, walletConnected],
  },
  {
    path: 'game',
    loadChildren: () => import('./features/game/game-shell.routes'),
    canActivate: [authGuard, walletConnected],
  },
  {
    path: 'marketplace',
    loadChildren: () => import('./features/marketplace/marketplace-shell.routes'),
    canActivate: [walletConnected]
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
];
