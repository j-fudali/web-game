import { Injectable, Signal } from '@angular/core';
import { createThirdwebClient, getContract } from 'thirdweb';
import { environment } from '../../../environments/environment';
import { polygonAmoy } from 'thirdweb/chains';
import {
  createWallet,
  getWalletBalance,
  injectedProvider,
} from 'thirdweb/wallets';
import { Subject, filter, from, map, merge, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { WalletData } from '../interfaces/wallet-data';

export interface WalletDataState {
  data: Signal<WalletData | undefined>;
  status: Signal<'connected' | 'disconnected' | 'loading' | 'error'>;
  error: Signal<string | null>;
}

@Injectable({
  providedIn: 'root',
})
export class ThirdwebService {
  private readonly chain = polygonAmoy;
  private readonly client = createThirdwebClient({
    clientId: environment.clientId,
  });
  private readonly startingWeapons = getContract({
    client: this.client,
    chain: this.chain,
    address: environment.startingWeaponsAddress,
  });
  private readonly metamask = createWallet('io.metamask');
  private readonly gearcoin = environment.gearcoin;

  connect$ = new Subject<void>();
  error$ = new Subject<Error>();

  private walletData$ = this.connect$.pipe(
    switchMap(() =>
      (injectedProvider('io.metamask')
        ? from(this.metamask.connect({ client: this.client }))
        : from(
            this.metamask.connect({
              client: this.client,
              walletConnect: { showQrModal: true },
            })
          )
      ).pipe(
        switchMap((account) =>
          from(
            getWalletBalance({
              client: this.client,
              chain: this.chain,
              address: account.address,
              tokenAddress: this.gearcoin,
            })
          ).pipe(
            map((balance) => ({
              account,
              balance,
            }))
          )
        )
      )
    )
  );
  private status$ = merge(
    this.walletData$.pipe(map((data) => (data ? 'connected' : 'disconnected'))),
    this.connect$.pipe(map(() => 'loading' as const)),
    this.error$.pipe(map(() => 'error' as const))
  );

  private status = toSignal(this.status$, { initialValue: 'disconnected' });
  private walletData = toSignal<WalletData>(this.walletData$, {
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
