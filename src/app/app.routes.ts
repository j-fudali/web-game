import { Routes } from '@angular/router';
import { alreadyLoggedIn, authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () =>
      import('./features/home/pages/start/start.component').then(
        (c) => c.StartComponent
      ),
    canActivate: [alreadyLoggedIn],
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./core/auth/pages/sign-up/sign-up.component').then(
        (c) => c.SignUpComponent
      ),
    canActivate: [alreadyLoggedIn],
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./core/auth/pages/login/login.component').then(
        (c) => c.LoginComponent
      ),
    canActivate: [alreadyLoggedIn],
  },
  {
    path: 'game',
    loadChildren: () => import('./features/game/game-shell.routes'),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
];
