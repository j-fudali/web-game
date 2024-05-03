import { HttpHeaders, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  if (authService.isLoggedIn()) {
    const authRequest = req.clone({
      headers: new HttpHeaders().set(
        'Authorization',
        `Bearer ${authService.getToken()}`
      ),
    });
    return next(authRequest);
  }
  return next(req);
};
