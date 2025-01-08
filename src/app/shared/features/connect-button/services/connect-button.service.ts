import { inject, Injectable } from '@angular/core';
import { AuthService } from 'app/shared/services/auth.service';
import { ThirdwebService } from 'app/shared/thirdweb/thirdweb.service';
import { map, tap } from 'rxjs';

@Injectable()
export class ConnectButtonService {
  private _thirdwebService = inject(ThirdwebService);
  private _authService = inject(AuthService);
  isDisconnected$() {
    return this._thirdwebService.getIsDisconnected$();
  }
  isDisconnected() {
    return this._thirdwebService.getIsDisconnected();
  }
  getAccountAddress$() {
    return this._thirdwebService.getAccount$().pipe(map(acc => acc.address));
  }
  getWalletBalance$() {
    return this._thirdwebService.getBalance();
  }
  connect$() {
    return this._thirdwebService.connect();
  }
  disconnect$() {
    return this._thirdwebService
      .disconnect()
      .pipe(tap(() => this._authService.signOut()));
  }
}
