import { Injectable, Signal, inject, signal } from '@angular/core';
import { SignUpCredentials } from '../interfaces/sign-up-credentials';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { CookieService } from 'ngx-cookie-service';
import { LoginCredentials } from '../interfaces/login-credentials';
import { TokenResponse } from '../interfaces/token-response';
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
  throwError,
} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';

export interface AuthState {
  isLogged: Signal<boolean>;
  status: Signal<'success' | 'error' | 'loading' | null>;
  error: Signal<string | null>;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private _cookies = inject(CookieService);
  private url = environment.url + '/auth';
  private router = inject(Router);
  private messageService = inject(MessageService);
  private error$ = new Subject<Error>();
  login$ = new Subject<LoginCredentials>();
  signUp$ = new Subject<SignUpCredentials>();
  signOut$ = new Subject<void>();

  onLogin$ = this.login$.pipe(
    switchMap((loginCredentials) =>
      this.http.post<TokenResponse>(this.url + '/login', loginCredentials).pipe(
        catchError((err: HttpErrorResponse) => {
          let message;
          switch (err.status) {
            case 401:
              message = 'Nie poprawne dane logowania';
              break;
            default:
              message = 'Nieznany błąd';
          }
          this.messageService.add({
            summary: 'Błąd',
            detail: message,
            severity: 'error',
          });
          this.error$.next(err);
          return of(null);
        })
      )
    ),
    tap((response) => {
      if (!response) return;
      this.setToken(response.token);
      this.router.navigate(['/game']);
    }),
    shareReplay(1)
  );
  onSignUp$ = this.signUp$.pipe(
    switchMap((signUpCredentials) =>
      this.http
        .post<TokenResponse>(this.url + '/sign-up', signUpCredentials)
        .pipe(
          catchError((err: HttpErrorResponse) => {
            let message;
            switch (err.status) {
              case 409:
                message = `${
                  (err.error.message as string).startsWith('E-mail')
                    ? 'E-mail'
                    : 'Portfel kryptwalutowy'
                }
             jest już w użyciu`;
                break;
              default:
                message = 'Nieznany błąd';
            }
            this.messageService.add({
              summary: 'Błąd',
              detail: message,
              severity: 'error',
            });
            this.error$.next(err);
            return of(null);
          })
        )
    ),
    tap((response) => {
      if (!response) return;
      this.setToken(response.token);
      this.router.navigate(['/game']);
    }),
    shareReplay(1)
  );
  onSignOut$ = this.signOut$.pipe(
    tap(() => {
      this._cookies.delete('token', '/');
      this.router.navigate(['/']);
    })
  );
  private isLogged$ = merge(
    merge(this.onLogin$, this.onSignUp$).pipe(
      filter((val) => val !== null),
      map(() => true)
    ),
    this.onSignOut$.pipe(map(() => false))
  );
  private status$ = merge(
    merge(this.login$, this.signUp$, this.signOut$).pipe(
      map(() => 'loading' as const)
    ),
    merge(this.onLogin$, this.onSignUp$).pipe(
      filter((val) => val !== null),
      map(() => 'success' as const)
    ),
    this.onSignOut$.pipe(map(() => null)),
    this.error$.pipe(map(() => 'error' as const))
  );

  getToken() {
    return this._cookies.get('token') || null;
  }

  private setToken(token: string) {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    this._cookies.set('token', token, date, '/');
  }
  private error = toSignal(this.error$.pipe(map((err) => err.message)), {
    initialValue: null,
  });
  private isLogged = toSignal(this.isLogged$, {
    initialValue: this.getToken() ? true : false,
  });
  private status = toSignal(this.status$, {
    initialValue: null,
  });
  state: AuthState = {
    isLogged: this.isLogged,
    status: this.status,
    error: this.error,
  };
}
