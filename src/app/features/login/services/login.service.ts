import { inject, Injectable } from '@angular/core';
import { LoginCredentials } from 'app/shared/api/auth';
import { AuthService } from 'app/shared/services/auth.service';

@Injectable()
export class LoginService {
  private authService = inject(AuthService);

  login$(credentials: LoginCredentials) {
    return this.authService.login$(credentials);
  }
}
