import { Injectable, inject, signal } from '@angular/core';
import { SignUpCredentials } from '../interfaces/sign-up-credentials';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { CookieService } from 'ngx-cookie-service';
import { LoginCredentials } from '../interfaces/login-credentials';
import { TokenResponse } from '../interfaces/token-response';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private _cookies = inject(CookieService);
  private url = environment.url + '/auth';
  private router = inject(Router);
  private _isLoggedIn = signal(false);
  isLoggedIn = this._isLoggedIn.asReadonly();

  verifyUserLoggedIn() {
    this.getToken() ? this._isLoggedIn.set(true) : this._isLoggedIn.set(false);
  }

  getToken() {
    return this._cookies.get('token') || null;
  }

  setToken(token: string) {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    this._cookies.set('token', token, date, '/');
  }

  signUp(signUpCredentials: SignUpCredentials) {
    return this.http
      .post<TokenResponse>(this.url + '/sign-up', signUpCredentials)
      .pipe(tap(() => this._isLoggedIn.set(true)));
  }

  login(loginCredentials: LoginCredentials) {
    return this.http
      .post<TokenResponse>(this.url + '/login', loginCredentials)
      .pipe(tap(() => this._isLoggedIn.set(true)));
  }

  signOut() {
    this._cookies.delete('token', '/');
    this.router.navigate(['/']);
    this._isLoggedIn.set(false);
  }
}
