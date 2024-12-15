import { Injectable, Signal, inject } from '@angular/core';
import { SignUpCredentials } from '../interfaces/sign-up-credentials';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { CookieService } from 'ngx-cookie-service';
import { LoginCredentials } from '../api/auth/model/login-credentials';
import { TokenResponse } from '../api/auth/model/token-response';
import { Router } from '@angular/router';
import {
  Subject,
  catchError,
  filter,
  map,
  merge,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthApiService } from '../api/auth/auth-api.service';
import { JwtPayload, jwtDecode } from 'jwt-decode';

export interface AuthState {
  isAdmin: Signal<boolean | null>;
  isLogged: Signal<boolean>;
  status: Signal<'success' | 'error' | 'loading' | null>;
  error: Signal<string | null>;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _authApiService = inject(AuthApiService);
  private _cookies = inject(CookieService);
  private router = inject(Router);
  private error$ = new Subject<Error>();
  login$ = new Subject<LoginCredentials>();
  signUp$ = new Subject<SignUpCredentials>();
  signOut$ = new Subject<void>();

  onLogin$ = this.login$.pipe(
    switchMap(loginCredentials =>
      this._authApiService.login(loginCredentials).pipe(
        catchError(err => {
          this.error$.next(err);
          return of(undefined);
        })
      )
    ),
    filter(res => res !== undefined),
    map(res => res as TokenResponse),
    tap(response => {
      this.setToken(response.token);
      this.router.navigate(['/game']);
    }),
    shareReplay(1)
  );
  onSignUp$ = this.signUp$.pipe(
    switchMap(signUpCredentials =>
      this._authApiService.signUp(signUpCredentials).pipe(
        catchError((err: HttpErrorResponse) => {
          this.error$.next(err);
          return of(undefined);
        })
      )
    ),
    filter(res => res !== undefined),
    map(res => res as TokenResponse),
    tap(response => {
      this.setToken(response.token);
      this.router.navigate(['/game']);
    }),
    shareReplay(1)
  );
  onSignOut$ = this.signOut$.pipe(
    tap(() => this._cookies.delete('token')),
    tap(() => this.router.navigate(['/']))
  );
  private isLogged$ = merge(
    merge(this.onLogin$, this.onSignUp$).pipe(map(() => true)),
    this.onSignOut$.pipe(map(() => false))
  );
  private isAdmin$ = this.isLogged$.pipe(
    map(isLogged => {
      if (!isLogged) return null;
      return this.checkIsAdmin();
    })
  );
  private status$ = merge(
    merge(this.login$, this.signUp$, this.signOut$).pipe(
      map(() => 'loading' as const)
    ),
    merge(this.onLogin$, this.onSignUp$).pipe(
      filter(val => val !== null),
      map(() => 'success' as const)
    ),
    this.onSignOut$.pipe(map(() => null)),
    this.error$.pipe(map(() => 'error' as const))
  );
  private error = toSignal(this.error$.pipe(map(err => err.message)), {
    initialValue: null,
  });
  private isLogged = toSignal(this.isLogged$, {
    initialValue: this.getToken() ? true : false,
  });
  private isAdmin = toSignal(this.isAdmin$, {
    initialValue: this.checkIsAdmin(),
  });
  private status = toSignal(this.status$, {
    initialValue: null,
  });
  state: AuthState = {
    isAdmin: this.isAdmin,
    isLogged: this.isLogged,
    status: this.status,
    error: this.error,
  };
  getToken() {
    return this._cookies.get('token') || null;
  }
  checkIsAdmin(): boolean | null {
    const token = this.getToken();
    if (!token) return null;
    return (
      jwtDecode<JwtPayload & { role: string }>(token)['role'] === 'ROLE_ADMIN'
    );
  }
  private setToken(token: string) {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    this._cookies.set('token', token, date, '/');
  }
}
