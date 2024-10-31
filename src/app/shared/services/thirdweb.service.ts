import { Injectable, Signal, inject } from '@angular/core';
import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  sendAndConfirmTransaction,
  sendTransaction,
  toTokens,
} from 'thirdweb';
import { polygonAmoy } from 'thirdweb/chains';
import { Account, createWallet, getWalletBalance } from 'thirdweb/wallets';
import { environment } from '../../../environments/environment.development';
import { approve, claimTo as claimToERC20 } from 'thirdweb/extensions/erc20';
import {
  buyFromListing,
  createListing,
  getAllValidListings,
  isBuyerApprovedForListing,
} from 'thirdweb/extensions/marketplace';
import {
  claimTo,
  getNFTs,
  getOwnedNFTs,
  isApprovedForAll,
  mintTo,
  setApprovalForAll,
} from 'thirdweb/extensions/erc1155';
import {
  BehaviorSubject,
  Observable,
  Subject,
  catchError,
  combineLatest,
  filter,
  from,
  map,
  merge,
  of,
  pipe,
  shareReplay,
  switchMap,
  tap,
  throwError,
  withLatestFrom,
} from 'rxjs';
import { RPCError } from '../interfaces/rpc-error';
import { toSignal } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { WalletData } from '../interfaces/wallet-data';
import { SellData } from '../../features/marketplace/interfaces/sell-data';
import { Hex } from 'thirdweb/dist/types/utils/encoding/hex';
import { MarketplaceItem } from '../../features/marketplace/interfaces/marketplace-item';
import { LoggerService } from './logger.service';

export interface WalletDataState {
  data: Signal<WalletData | undefined>;
  status: Signal<
    'connected' | 'disconnected' | 'loading' | 'error' | 'token-claimed'
  >;
  error: Signal<string | null>;
}

@Injectable({
  providedIn: 'root',
})
export class ThirdwebService {
  private logger = inject(LoggerService);
  private CONNECT_ERROR = 'Błąd połączenia z portfelem kryptowalut';
  private AUTOCONNECT_ERROR =
    'Błąd automatycznego połączenia z portfelem kryptowalut';
  private DISCONNECT_ERROR = 'Błąd rozłączenia z portfelem kryptowalut';
  private GET_OWNED_ITEMS_ERROR = 'Błąd pobrania posiadanych przedmiotów';
  private GET_STARTING_WEAPON_ERROR = 'Błąd pobierania broni startowych';
  private CLAIM_STARTING_WEAPON_ERROR = 'Błąd odbierania broni startowej';
  private GET_LISTINGS_ERROR = 'Błąd pobrania listingu przedmiotów';
  private CREATE_LISTING_ERROR = 'Błąd dodowania listingu przedmiotu';
  private BUY_FROM_LISTING_ERROR = 'Błąd kupowania listingu przedmiotu';
  private metamask = createWallet('io.metamask');
  private chain = polygonAmoy;
  private client = createThirdwebClient({
    clientId: environment.clientId,
  });
  private gearcoin = getContract({
    client: this.client,
    chain: this.chain,
    address: environment.gearcoin,
  });
  private items = getContract({
    client: this.client,
    chain: this.chain,
    address: environment.itemsAddress,
  });
  private packContract = getContract({
    client: this.client,
    chain: this.chain,
    address: environment.packContract,
  });
  private marketplaceContract = getContract({
    client: this.client,
    chain: this.chain,
    address: environment.marketplace,
  });
  disconnect$ = new Subject<void>();
  connect$ = new Subject<void>();
  error$ = new Subject<Error>();
  gainGearcoins$ = new Subject<number>();
  private isDiconnected$ = new BehaviorSubject<string | null>(
    localStorage.getItem('isDisconnected')
  );
  private disconnectWallet$ = this.disconnect$.pipe(
    switchMap(() =>
      this.disconnect().pipe(
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
      this.connect().pipe(
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
        ? this.autoConnect().pipe(
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
    switchMap(coinsAmount =>
      this.claimGearcoin(coinsAmount).pipe(
        catchError((err: RPCError) => {
          console.log(err);
          if (err.code === 4001) {
            of(true);
          }
          return of(undefined);
        })
      )
    ),
    filter(res => res !== undefined),
    withLatestFrom(this.account$),
    map(([_, account]) => account),
    shareReplay(1)
  );

  private walletData$: Observable<WalletData | undefined> = merge(
    this.account$,
    this.onGainGearcoins$
  ).pipe(
    switchMap(account =>
      this.getBalance(account).pipe(
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

  private status = toSignal(this.status$, { initialValue: 'loading' });
  private walletData = toSignal<WalletData | undefined>(this.walletData$, {
    initialValue: undefined,
  });
  private error = toSignal(this.error$.pipe(map(err => err.message)), {
    initialValue: null,
  });

  public state: WalletDataState = {
    data: this.walletData,
    status: this.status,
    error: this.error,
  };
  getOwnedItems() {
    return this.account$.pipe(
      switchMap(({ address }) =>
        getOwnedNFTs({
          contract: this.items,
          address,
        })
      ),
      catchError(err => {
        this.logger.showErrorMessage(this.GET_OWNED_ITEMS_ERROR);
        return of(undefined);
      })
    );
  }
  claimStartingWeapon(tokenId: bigint) {
    return this.account$.pipe(
      switchMap(account =>
        sendAndConfirmTransaction({
          transaction: claimTo({
            contract: this.items,
            to: account.address,
            tokenId,
            quantity: 1n,
          }),
          account,
        })
      ),
      catchError(err => {
        this.logger.showErrorMessage(this.CLAIM_STARTING_WEAPON_ERROR);
        return throwError(() => err);
      })
    );
  }
  getListings() {
    return from(
      getAllValidListings({ contract: this.marketplaceContract })
    ).pipe(
      catchError(err => {
        this.logger.showErrorMessage(this.GET_LISTINGS_ERROR);
        return throwError(() => err);
      })
    );
  }
  createListing({ item, price }: SellData) {
    return this.account$.pipe(
      switchMap(account =>
        this.checkApproval(account).pipe(
          filter(res => res !== undefined),
          map(() => account)
        )
      ),
      switchMap(account =>
        sendAndConfirmTransaction({
          account,
          transaction: createListing({
            contract: this.marketplaceContract,
            assetContractAddress: this.items.address,
            tokenId: item.tokenId,
            quantity: 1n,
            pricePerToken: price.toString(),
            currencyContractAddress: this.gearcoin.address,
          }),
        })
      ),
      catchError(err => {
        this.logger.showErrorMessage(this.CREATE_LISTING_ERROR);
        return throwError(() => err);
      })
    );
  }
  buyFromListing(item: MarketplaceItem) {
    return this.account$.pipe(
      switchMap(account =>
        from(
          sendAndConfirmTransaction({
            account,
            transaction: approve({
              contract: this.gearcoin,
              spender: this.marketplaceContract.address as Hex,
              amount: toTokens(item.balance.value, item.balance.decimals),
            }),
          })
        ).pipe(map(() => account))
      ),
      switchMap(account =>
        sendAndConfirmTransaction({
          account,
          transaction: buyFromListing({
            contract: this.marketplaceContract,
            listingId: item.listingId,
            quantity: 1n,
            recipient: account.address,
          }),
        })
      ),
      catchError((err: Error) => {
        this.logger.showErrorMessage(this.BUY_FROM_LISTING_ERROR);
        return throwError(() => err);
      })
    );
  }
  getStartingItems() {
    return from(getNFTs({ contract: this.items })).pipe(
      catchError(err => {
        this.logger.showErrorMessage(this.GET_STARTING_WEAPON_ERROR);
        return throwError(() => err);
      })
    );
  }
  private checkApproval(account: Account) {
    return from(
      isApprovedForAll({
        contract: this.items,
        owner: account.address,
        operator: this.marketplaceContract.address,
      })
    ).pipe(
      switchMap(isApproved =>
        isApproved
          ? of(true)
          : sendAndConfirmTransaction({
              account,
              transaction: setApprovalForAll({
                contract: this.items,
                operator: this.marketplaceContract.address,
                approved: true,
              }),
            })
      ),
      catchError((err: RPCError) => {
        this.logger.showErrorMessage(this.getErrorMessage(err));
        return throwError(() => err);
      })
    );
  }
  private getBalance({ address }: Account) {
    return from(
      getWalletBalance({
        client: this.client,
        chain: this.chain,
        address,
        tokenAddress: this.gearcoin.address,
      })
    ).pipe(
      catchError((err: RPCError) => {
        this.logger.showErrorMessage(this.getErrorMessage(err));
        this.error$.next(err);
        return of(undefined);
      })
    );
  }
  private claimGearcoin(quantity: number) {
    return this.account$.pipe(
      switchMap(account => {
        const transaction = claimToERC20({
          contract: this.gearcoin,
          to: account.address,
          quantity: BigInt(quantity).toString(),
        });
        return sendAndConfirmTransaction({ transaction, account });
      }),
      catchError((err: RPCError) => {
        this.logger.showErrorMessage(this.getErrorMessage(err));
        this.error$.next(err);
        return of(undefined);
      })
    );
  }
  private connect() {
    return from(this.metamask.connect({ client: this.client })).pipe(
      catchError((err: RPCError) => {
        this.logger.showErrorMessage(this.getErrorMessage(err));
        this.error$.next(err);
        return of(undefined);
      })
    );
  }
  private disconnect() {
    return from(this.metamask.disconnect()).pipe(
      catchError((err: RPCError) => {
        this.logger.showErrorMessage(this.getErrorMessage(err));
        this.error$.next(err);
        return of(undefined);
      })
    );
  }
  private autoConnect() {
    return from(this.metamask.autoConnect({ client: this.client })).pipe(
      catchError((err: RPCError) => {
        this.logger.showErrorMessage(this.getErrorMessage(err));
        this.error$.next(err);
        return of(undefined);
      })
    );
  }
  private getErrorMessage(err: RPCError) {
    switch (err.code) {
      case 4001:
        return 'Połączenie zostało odrzucone';
      case -32002:
        return 'Zajrzyj do swojego portfela i zaakceptuj połączenie';
      case -32603:
        return 'Błąd wewnętrzny Metamask. Spróbuj ponownie później';
      default:
        return 'Nie można nawiązać połączenia';
    }
  }
}
