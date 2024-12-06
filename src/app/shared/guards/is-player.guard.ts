import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const isPlayerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
  if (!token) return router.parseUrl('/login');
  return !authService.checkIsAdmin() ? true : router.parseUrl('/admin');
};
