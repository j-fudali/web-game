import { SignUpCredentials } from './../interfaces/sign-up-credentials';
import { LoginCredentials } from './../api/auth/model/login-credentials';
import { Injectable, inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { TokenResponse } from '../api/auth/model/token-response';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthApiService } from '../api/auth/auth-api.service';
import { JwtPayload, jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _authApiService = inject(AuthApiService);
  private _cookies = inject(CookieService);
  private router = inject(Router);
  private _isLoggedIn$ = new BehaviorSubject<boolean>(!!this.getToken());

  getIsLoggedIn$(): Observable<boolean> {
    return this._isLoggedIn$.asObservable();
  }
  getIsLoggedIn(): boolean {
    return this._isLoggedIn$.getValue();
  }
  login$(loginCredentials: LoginCredentials): Observable<TokenResponse> {
    return this._authApiService.login(loginCredentials).pipe(
      tap(response => {
        this.setToken(response.token);
        this._isLoggedIn$.next(true);
      })
    );
  }
  signUp$(signUpCredentials: SignUpCredentials) {
    return this._authApiService.signUp(signUpCredentials).pipe(
      tap(response => {
        this.setToken(response.token);
        this._isLoggedIn$.next(true);
      })
    );
  }
  signOut() {
    this._isLoggedIn$.next(false);
    this.router.navigate(['/']);
    this._cookies.delete('token', '/');
  }
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
