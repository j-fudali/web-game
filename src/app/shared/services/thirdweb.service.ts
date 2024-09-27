import { Injectable, Signal, inject } from '@angular/core';
import { createThirdwebClient, getContract, sendTransaction } from 'thirdweb';
import { polygonAmoy } from 'thirdweb/chains';
import { Account, createWallet, getWalletBalance } from 'thirdweb/wallets';
import { environment } from '../../../environments/environment.development';
import { claimTo as claimToERC20} from "thirdweb/extensions/erc20";
import { claimTo, getNFTs, getOwnedNFTs } from "thirdweb/extensions/erc1155";
import { BehaviorSubject, Subject, catchError, filter, from, map, merge, of, shareReplay, switchMap, tap } from 'rxjs';
import { RPCError } from '../interfaces/rpc-error';
import { toSignal } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { WalletData } from '../interfaces/wallet-data';

export interface WalletDataState {
  data: Signal<WalletData | undefined>;
  status: Signal<'connected' | 'disconnected' | 'loading' | 'error'>;
  error: Signal<string | null>;
}

@Injectable({
  providedIn: 'root'
})
export class ThirdwebService {
  private _messageService = inject(MessageService);
  private metamask = createWallet('io.metamask');
  private chain = polygonAmoy;
  private client = createThirdwebClient({
    clientId: environment.clientId,
  });
  private gearcoin = getContract({
    client: this.client, chain: this.chain, address: environment.gearcoin
  });
  private startingWeapons = getContract({
    client: this.client,
    chain: this.chain,
    address: environment.startingWeaponsAddress,
  });
  private packContract = getContract({
    client: this.client,
    chain: this.chain,
    address: environment.packContract,
  });
  private marketplaceContract = getContract({
    client: this.client,
    chain: this.chain,
    address: environment.marketplace
  })
  disconnect$ = new Subject<void>();
  connect$ = new Subject<void>();
  error$ = new Subject<RPCError>();

  private isDiconnected$ = new BehaviorSubject<string | null>(
    localStorage.getItem('isDisconnected')
  );
  private disconnectWallet$ = this.disconnect$.pipe(
    switchMap(() =>
     this.disconnect().pipe(
        catchError((err) => {
          this.error$.next(err);
          return of(undefined);
        })
      )
    ),
    tap(() => localStorage.setItem('isDisconnected', 'true'))
  );
  private onConnect$ = this.connect$.pipe(
    switchMap(() =>
      this.connect().pipe(
        catchError((err: RPCError) => {
          const message = this.getErrorMessage(err);
          this._messageService.add({
            severity: 'error',
            summary: 'Błąd',
            detail: message,
          });
          this.error$.next(err);
          return of(undefined);
        })
      )
    ),
    tap(() => localStorage.setItem('isDisconnected', 'false')),
    shareReplay(1)
  );
  private autoConnect$ = this.isDiconnected$.pipe(
    switchMap((val) =>
      !val || val == 'false'
        ? this.autoConnect().pipe(
            catchError((err) => {
              this.error$.next(err);
              return of(undefined);
            })
          )
        : of(undefined)
    ),
    shareReplay(1)
  );
  private connection$ = merge(
    this.autoConnect$,
    this.onConnect$,
    this.disconnectWallet$
  ).pipe(
    switchMap((account) => {
      if (!account) return of(undefined);
      return this.getBalance(account)
        .pipe(
          map((balance) => ({
            account,
            balance,
          } as WalletData))
        );
    })
  );
  private status$ = merge(
    this.connection$.pipe(map((data) => (data ? 'connected' : 'disconnected'))),
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

  private getErrorMessage(err: RPCError){
    switch (err.code) {
      case 4001:
        return 'Połączenie zostało odrzucone';
        break;
      case -32002:
        return 'Zajrzyj do swojego portfela i zaakceptuj połączenie';
        break;
      default:
       return 'Nie można nawiązać połączenia';
    }
  }
  private getBalance({address}: Account){
    return from(
      getWalletBalance({
        client: this.client,
        chain: this.chain,
        address,
        tokenAddress: this.gearcoin.address,
      })
    )
  }
  private connect(){
    return from(this.metamask.connect({ client: this.client }))
  }
  private disconnect(){
    return from(this.metamask.disconnect())

  }
  private autoConnect(){
    return from(this.metamask.autoConnect({ client: this.client }))
  }
  getStartingItems(){
    return from(getNFTs({ contract: this.startingWeapons }));
  }
  getOwnedItems(){
    return this.connection$.pipe(
      filter(walletData => walletData !== undefined),
      map((walletData) => (walletData as WalletData).account),
      switchMap(({address}) => 
        getOwnedNFTs({
          contract: this.startingWeapons,
          address,
        })
    ))
  }

  claimGearcoin(quantity: number){
    return this.connection$.pipe(
      filter((walletData) => walletData !== undefined),
      map((walletData) => (walletData as WalletData).account),
      switchMap((account) => {
        const transaction = claimToERC20({
          contract: this.gearcoin,
          to: account.address,
          quantity: BigInt(quantity).toString()
        })
        return sendTransaction({transaction, account})
      })
    )
  }
  claimStartingWeapon(tokenId: bigint){
    return this.connection$.pipe(
      filter(walletData => walletData !== undefined),
      map(walletData => (walletData as WalletData).account),
      switchMap((account) => sendTransaction({
        transaction: claimTo({
          contract: this.startingWeapons,
          to: account.address,
          tokenId,
          quantity: 1n,
        }),
        account,
      }))
    )
  }

}
