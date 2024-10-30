import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, of, throwError } from 'rxjs';
import { TokenResponse } from './model/token-response';
import { environment } from '../../../../environments/environment.development';
import { LoginCredentials } from './model/login-credentials';
import { SERVER_ERROR } from '../../utils/common-errors-messages';
import { LoggerService } from '../../services/logger.service';
import { SignUpCredentials } from '../../interfaces/sign-up-credentials';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private BASE_URL = environment.url + '/auth';
  private readonly BAD_CREDENTIALS = 'Nie poprawne dane logowania';
  private readonly DUPLICATE_ERROR = (err: HttpErrorResponse) =>
    `${
      (err.error.message as string).startsWith('E-mail')
        ? 'E-mail'
        : 'Portfel kryptwalutowy'
    } jest już w użyciu`;
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
        return this.BAD_CREDENTIALS;
      case 409:
        return this.DUPLICATE_ERROR(error);
      default:
        return SERVER_ERROR;
    }
  }
}
