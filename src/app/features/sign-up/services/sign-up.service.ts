import { inject, Injectable } from '@angular/core';
import { SignUpCredentials } from 'app/shared/interfaces/sign-up-credentials';
import { AuthService } from 'app/shared/services/auth.service';

@Injectable()
export class SignUpService {
  private _authService = inject(AuthService);

  signUp$(credentias: SignUpCredentials) {
    return this._authService.signUp$(credentias);
  }
}
