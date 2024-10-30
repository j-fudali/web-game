import { Injectable, Signal, inject } from '@angular/core';
import { createThirdwebClient, getContract, sendAndConfirmTransaction, sendTransaction } from 'thirdweb';
import { polygonAmoy } from 'thirdweb/chains';
import { Account, createWallet, getWalletBalance } from 'thirdweb/wallets';
import { environment } from '../../../environments/environment.development';
import { claimTo as claimToERC20} from "thirdweb/extensions/erc20";
import { claimTo, getNFTs, getOwnedNFTs } from "thirdweb/extensions/erc1155";
import { BehaviorSubject, Observable, Subject, catchError, filter, from, map, merge, of, shareReplay, switchMap, tap, withLatestFrom } from 'rxjs';
import { RPCError } from '../interfaces/rpc-error';
import { toSignal } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { WalletData } from '../interfaces/wallet-data';

export interface WalletDataState {
  data: Signal<WalletData | undefined>;
  status: Signal<'connected' | 'disconnected' | 'loading' | 'error' | 'token-claimed' | 'token-burned'>;
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
    address: environment.itemsAddress,
  });
  private packContract = getContract({
    client: this.client,
    chain: this.chain,
    address: environment.packContract,
  });

  disconnect$ = new Subject<void>();
  connect$ = new Subject<void>();
  error$ = new Subject<RPCError>();
  gainGearcoins$ = new Subject<number>()
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
      val === null || val == 'false'
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
  private account$ =  merge(
    this.autoConnect$,
    this.onConnect$,
    this.disconnectWallet$,
  ).pipe(
    filter((account) => account !== undefined),
    map((account) => account as Account),
  )
  private onGainGearcoins$ = this.gainGearcoins$.pipe(
    switchMap((coinsAmount) => this.claimGearcoin(coinsAmount)
      .pipe(
        catchError((err: RPCError) => {
          console.log(err)
          if(err.code === 4001){
            of(true)
          }
          return of(undefined)
        })
      )
    ),
    filter((res) => res !== undefined),
    withLatestFrom(this.account$),
    map(([_, account]) => account),
    shareReplay(1)
  )
 
  private walletData$: Observable<WalletData | undefined> = merge(this.account$, this.onGainGearcoins$)
    .pipe(
      switchMap((account) => this.getBalance(account).pipe(
        map((balance) => ({
          account,
          balance,
        } as WalletData)
        ),
      )),
      shareReplay(1),
  );

  private status$ = merge(
    this.walletData$.pipe(map((data) => (data ? 'connected' as const : 'disconnected' as const))),
    this.disconnectWallet$.pipe(map(() => 'disconnected' as const)),
    merge(
      this.connect$, 
      this.disconnect$, 
      this.autoConnect$.pipe(filter(acc => acc !== undefined)
    ), 
    this.gainGearcoins$).pipe(map(() => 'loading' as const)),
    this.autoConnect$.pipe(filter(acc => acc === undefined), map(() => 'disconnected' as const)),
    this.error$.pipe(map(() => 'error' as const))
  )

  private status = toSignal(this.status$, { initialValue: 'loading' });
  private walletData = toSignal<WalletData | undefined>(this.walletData$, {
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
      case -32002:
        return 'Zajrzyj do swojego portfela i zaakceptuj połączenie';
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
 
  private claimGearcoin(quantity: number){
    return this.account$.pipe(
      switchMap((account) => {
        const transaction = claimToERC20({
          contract: this.gearcoin,
          to: account.address,
          quantity: BigInt(quantity).toString()
        })
        return sendAndConfirmTransaction({transaction, account})
      })
    )
  }


  connect(){
    return from(this.metamask.connect({ client: this.client }))
  }
  disconnect(){
    return from(this.metamask.disconnect())

  }
  autoConnect(){
    return from(this.metamask.autoConnect({ client: this.client }))
  }
  getStartingItems(){
    return from(getNFTs({ contract: this.startingWeapons }));
  }
  getOwnedItems(){
    return this.account$.pipe(
      switchMap(({address}) => 
        getOwnedNFTs({
          contract: this.startingWeapons,
          address,
        })
    ))
  }

  claimStartingWeapon(tokenId: bigint){
    return this.walletData$.pipe(
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
