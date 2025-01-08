import { Routes } from '@angular/router';
import {
  alreadyLoggedIn,
  authGuard,
  forceWalletConnected,
  walletConnected,
} from './shared/guards/auth.guard';
import { isAdminGuard } from './shared/guards/is-admin.guard';
import { isPlayerGuard } from './shared/guards/is-player.guard';
import { getPlayerCharacterResolver } from './shared/resolvers/get-player-character.resolver';
import { hasCharacterGuard } from './shared/guards/has-character.guard';
import { notHasCharacterGuard } from './shared/guards/not-has-character.guard';
import { EquipmentService } from './features/game/services/equipment.service';
import { PlayerCharacterService } from './features/game/services/player-character.service';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./features/start/start.component').then(c => c.StartComponent),
    canActivate: [alreadyLoggedIn],
    canDeactivate: [forceWalletConnected],
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./features/sign-up/sign-up.component').then(
        c => c.SignUpComponent
      ),
    canActivate: [alreadyLoggedIn, walletConnected],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then(c => c.LoginComponent),
    canActivate: [alreadyLoggedIn, walletConnected],
  },
  {
    path: 'create-character',
    loadChildren: () =>
      import('./features/create-character/create-character-shell.routes'),
    canActivate: [
      authGuard,
      walletConnected,
      isPlayerGuard,
      notHasCharacterGuard,
    ],
  },
  {
    path: 'game',
    loadChildren: () => import('./features/game/game-shell.routes'),
    canActivate: [authGuard, walletConnected, isPlayerGuard, hasCharacterGuard],
    providers: [EquipmentService, PlayerCharacterService],
    resolve: {
      playerCharacter: getPlayerCharacterResolver,
    },
  },
  {
    path: 'marketplace',
    loadChildren: () =>
      import('./features/marketplace/marketplace-shell.routes'),
    canActivate: [walletConnected],
  },
  {
    path: 'lootboxes',
    loadChildren: () => import('./features/lootboxes/lootboxes.routes'),
    canActivate: [walletConnected],
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin-panel/admin-panel.routes'),
    canActivate: [authGuard, walletConnected, isAdminGuard],
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
];
