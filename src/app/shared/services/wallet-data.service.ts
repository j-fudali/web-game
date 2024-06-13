import { Injectable, Signal, inject } from '@angular/core';
import { getWalletBalance, injectedProvider } from 'thirdweb/wallets';
import {
  BehaviorSubject,
  Subject,
  catchError,
  from,
  map,
  merge,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { WalletData } from '../interfaces/wallet-data';
import {
  chain,
  client,
  gearcoin,
  metamask,
} from '../constants/thirdweb.constants';
import { RPCError } from '../interfaces/rpc-error';
import { MessageService } from 'primeng/api';

export interface WalletDataState {
  data: Signal<WalletData | undefined>;
  status: Signal<'connected' | 'disconnected' | 'loading' | 'error'>;
  error: Signal<string | null>;
}

@Injectable({
  providedIn: 'root',
})
export class WalletDataService {
  private _messageService = inject(MessageService);

  disconnect$ = new Subject<void>();
  connect$ = new Subject<void>();
  error$ = new Subject<RPCError>();

  private isDiconnected$ = new BehaviorSubject<string | null>(
    localStorage.getItem('isDisconnected')
  );
  private disconnectWallet$ = this.disconnect$.pipe(
    switchMap(() => from(metamask.disconnect())),
    tap(() => localStorage.setItem('isDisconnected', 'true'))
  );
  private onConnect$ = this.connect$.pipe(
    switchMap(() => from(metamask.connect({ client }))),
    tap(() => localStorage.setItem('isDisconnected', 'false')),
    catchError((err: RPCError) => {
      let message;
      if (err.code == 4001) {
        message = 'Połączenie zostało odrzucone';
      } else {
        message = 'Nie można nawiązać połączenia';
      }
      this._messageService.add({
        severity: 'error',
        summary: 'Błąd',
        detail: message,
      });
      this.error$.next(err);
      return of(undefined);
    }),
    shareReplay(1)
  );
  private autoConnect$ = this.isDiconnected$.pipe(
    switchMap((val) => {
      if (!val || val == 'false') {
        return from(metamask.autoConnect({ client })).pipe(
          catchError(() => of(undefined))
        );
      }
      return of(undefined);
    }),
    shareReplay(1)
  );

  private connection$ = merge(
    this.autoConnect$,
    this.onConnect$,
    this.disconnectWallet$
  ).pipe(
    switchMap((account) => {
      if (account) {
        return from(
          getWalletBalance({
            client,
            chain,
            address: account.address,
            tokenAddress: gearcoin,
          })
        ).pipe(
          map((balance) => ({
            account,
            balance,
          }))
        );
      }
      return of(undefined);
    }),
    catchError((err) => {
      this.error$.next(err);
      return throwError(() => err);
    })
  );
  private status$ = merge(
    this.connection$.pipe(
      map((data) => (data ? 'connected' : 'disconnected')),
      catchError(() => of('disconnected' as const))
    ),
    this.disconnectWallet$.pipe(map(() => 'disconnected' as const)),
    this.connect$.pipe(map(() => 'loading' as const)),
    this.disconnect$.pipe(map(() => 'loading' as const)),
    this.error$.pipe(map(() => 'error' as const))
  );

  private status = toSignal(this.status$, { initialValue: 'loading' });
  private walletData = toSignal<WalletData | undefined>(this.connection$, {
    initialValue: undefined,
  });
  private error = toSignal(this.error$.pipe(map((err) => err.message)), {
    initialValue: null,
  });

  public state: WalletDataState = {
    data: this.walletData,
    status: this.status,
    error: this.error,
  };
}
