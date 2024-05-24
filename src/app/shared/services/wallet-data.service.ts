import { Injectable, Signal, inject, signal } from '@angular/core';
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
import { getInstalledWalletProviders } from 'thirdweb/dist/types/wallets/injected/mipdStore';

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
  error$ = new Subject<Error>();

  private isDiconnected$ = new BehaviorSubject<string | null>(
    localStorage.getItem('isDisconnected')
  );
  private disconnectWallet$ = this.disconnect$.pipe(
    switchMap(() => from(metamask.disconnect())),
    tap(() => localStorage.setItem('isDisconnected', 'true'))
  );
  private onConnect$ = this.connect$.pipe(
    switchMap(() =>
      (injectedProvider('io.metamask')
        ? from(metamask.connect({ client }))
        : from(
            metamask.connect({
              client,
              walletConnect: { showQrModal: true },
            })
          )
      ).pipe(
        catchError((err: RPCError) => {
          console.log(err.code);
          if (err.code == 4001) {
            this._messageService.add({
              severity: 'error',
              summary: 'Błąd',
              detail: 'Połączenie zostało odrzucone',
            });
          }
          return of(undefined);
        })
      )
    ),
    tap(() => localStorage.setItem('isDisconnected', 'false')),
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
    })
  );
  private status$ = merge(
    this.connection$.pipe(
      map((data) => (data ? 'connected' : 'disconnected')),
      catchError((err: Error) => {
        return of('disconnected' as const);
      })
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
