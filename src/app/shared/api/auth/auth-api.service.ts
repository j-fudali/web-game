import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { TokenResponse } from './model/token-response';
import { LoginCredentials } from './model/login-credentials';
import { SERVER_ERROR } from '../../utils/common-errors-messages';
import { LoggerService } from '../../services/logger.service';
import { SignUpCredentials } from '../../interfaces/sign-up-credentials';
import { APP_CONFIG } from '@jfudali/shared/config';
import { TEXTS } from '../texts/texts.const';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private appConfig = inject(APP_CONFIG);
  private BASE_URL: string = this.appConfig.url + '/auth';

  login(loginCredentials: LoginCredentials) {
    const url = this.BASE_URL + '/login';
    return this.http.post<TokenResponse>(url, loginCredentials).pipe(
      catchError((err: HttpErrorResponse) => {
        this.logger.showErrorMessage(this.getErrorMessage(err));
        return throwError(() => err);
      })
    );
  }
  signUp(signUpCredentials: SignUpCredentials) {
    const url = this.BASE_URL + '/sign-up';
    return this.http.post<TokenResponse>(url, signUpCredentials).pipe(
      catchError((err: HttpErrorResponse) => {
        this.logger.showErrorMessage(this.getErrorMessage(err));
        return throwError(() => err);
      })
    );
  }
  private getErrorMessage(error: HttpErrorResponse) {
    switch (error.status) {
      case 401:
        return TEXTS.AUTH_BAD_CREDENTIALS;
      case 409:
        return TEXTS.AUTH_DUPLICATE_ERROR(error);
      default:
        return SERVER_ERROR;
    }
  }
}
