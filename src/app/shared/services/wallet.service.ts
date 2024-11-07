import { Injectable, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Observable,
  merge,
  switchMap,
  map,
  shareReplay,
  BehaviorSubject,
  Subject,
  catchError,
  filter,
  of,
  tap,
  withLatestFrom,
} from 'rxjs';
import { WalletData } from '../interfaces/wallet-data';
import { ThirdwebService } from './thirdweb.service';
import { Account } from 'thirdweb/wallets';
import { RPCError } from '../interfaces/rpc-error';
import { LoggerService } from './logger.service';
export interface WalletDataState {
  account: Signal<Account>;
  wallet: Signal<WalletData | undefined>;
  status: Signal<
    'connected' | 'disconnected' | 'loading' | 'error' | 'token-claimed'
  >;
  error: Signal<string | null>;
}
@Injectable({
  providedIn: 'root',
})
export class WalletService {
  private CONNECT_ERROR = 'Błąd połączenia z portfelem kryptowalut';
  private AUTOCONNECT_ERROR =
    'Błąd automatycznego połączenia z portfelem kryptowalut';
  private DISCONNECT_ERROR = 'Błąd rozłączenia z portfelem kryptowalut';
  private logger = inject(LoggerService);
  private _thirdwebService = inject(ThirdwebService);
  disconnect$ = new Subject<void>();
  connect$ = new Subject<void>();
  error$ = new Subject<Error>();
  gainGearcoins$ = new Subject<number>();
  loseGearcoins$ = new Subject<number>();
  private isDiconnected$ = new BehaviorSubject<string | null>(
    localStorage.getItem('isDisconnected')
  );
  private disconnectWallet$ = this.disconnect$.pipe(
    switchMap(() =>
      this._thirdwebService.disconnect().pipe(
        catchError(err => {
          this.logger.showErrorMessage(this.DISCONNECT_ERROR);
          this.error$.next(err);
          localStorage.removeItem('isDisconnected');
          return of(undefined);
        })
      )
    ),
    tap(() => localStorage.setItem('isDisconnected', 'true'))
  );
  private onConnect$ = this.connect$.pipe(
    switchMap(() =>
      this._thirdwebService.connect().pipe(
        catchError((err: RPCError) => {
          this.logger.showErrorMessage(this.CONNECT_ERROR);
          this.error$.next(err);
          localStorage.removeItem('isDisconnected');
          return of(undefined);
        })
      )
    ),
    tap(() => localStorage.setItem('isDisconnected', 'false')),
    shareReplay(1)
  );
  private autoConnect$ = this.isDiconnected$.pipe(
    switchMap(val =>
      val === null || val == 'false'
        ? this._thirdwebService.autoConnect().pipe(
            catchError(err => {
              this.logger.showErrorMessage(this.AUTOCONNECT_ERROR);
              this.error$.next(err);
              return of(undefined);
            })
          )
        : of(undefined)
    ),
    shareReplay(1)
  );
  private account$ = merge(
    this.autoConnect$,
    this.onConnect$,
    this.disconnectWallet$
  ).pipe(
    filter(account => account !== undefined),
    map(account => account as Account)
  );
  private onGainGearcoins$ = this.gainGearcoins$.pipe(
    withLatestFrom(this.account$),
    switchMap(([coinsAmount, account]) =>
      this._thirdwebService.claimGearcoin(account, coinsAmount).pipe(
        catchError((err: RPCError) => {
          if (err.code === 4001) {
            of(true);
          }
          this.error$.next(err);
          return of(undefined);
        })
      )
    ),
    filter(res => res !== undefined),
    withLatestFrom(this.account$),
    map(([_, account]) => account),
    shareReplay(1)
  );
  private onLoseGearcoins$ = this.loseGearcoins$.pipe(
    withLatestFrom(this.account$),
    map(([coins, account]) => account)
  );
  private walletData$: Observable<WalletData | undefined> = merge(
    this.account$,
    this.onGainGearcoins$,
    this.onLoseGearcoins$
  ).pipe(
    switchMap(account =>
      this._thirdwebService.getBalance(account).pipe(
        map(
          balance =>
            ({
              account,
              balance,
            } as WalletData)
        )
      )
    ),
    shareReplay(1)
  );
  private status$ = merge(
    this.walletData$.pipe(
      map(data => (data ? ('connected' as const) : ('disconnected' as const)))
    ),
    this.disconnectWallet$.pipe(map(() => 'disconnected' as const)),
    merge(
      this.connect$,
      this.disconnect$,
      this.autoConnect$.pipe(filter(acc => acc !== undefined)),
      this.gainGearcoins$
    ).pipe(map(() => 'loading' as const)),
    this.autoConnect$.pipe(
      filter(acc => acc === undefined),
      map(() => 'disconnected' as const)
    ),
    this.error$.pipe(map(() => 'error' as const))
  );
  private account = toSignal(this.account$, { initialValue: {} as Account });
  private status = toSignal(this.status$, { initialValue: 'loading' });
  private walletData = toSignal<WalletData | undefined>(this.walletData$, {
    initialValue: undefined,
  });
  private error = toSignal(this.error$.pipe(map(err => err.message)), {
    initialValue: null,
  });

  public state: WalletDataState = {
    account: this.account,
    wallet: this.walletData,
    status: this.status,
    error: this.error,
  };
}
