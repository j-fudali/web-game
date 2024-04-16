import { Injectable, inject } from '@angular/core';
import { SignUpCredentials } from '../interfaces/sign-up-credentials';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { CookieService } from 'ngx-cookie-service';
import { LoginCredentials } from '../interfaces/login-credentials';
import { TokenResponse } from '../interfaces/token-response';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private _cookies = inject(CookieService);
  private url = environment.url + '/auth';

  getToken() {
    return this._cookies.get('token');
  }

  setToken(token: string) {
    this._cookies.set(
      'token',
      token,
      new Date().setHours(new Date().getHours() + 24),
      '/'
    );
  }

  signUp(signUpCredentials: SignUpCredentials) {
    return this.http.post<TokenResponse>(
      this.url + '/sign-up',
      signUpCredentials
    );
  }

  login(loginCredentials: LoginCredentials) {
    return this.http.post<TokenResponse>(this.url + '/login', loginCredentials);
  }
}
