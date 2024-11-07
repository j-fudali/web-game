import { Injectable, inject } from '@angular/core';
import {
  createThirdwebClient,
  getContract,
  sendAndConfirmTransaction,
  toTokens,
} from 'thirdweb';
import { polygonAmoy } from 'thirdweb/chains';
import { Account, createWallet, getWalletBalance } from 'thirdweb/wallets';
import { environment } from '../../../environments/environment.development';
import {
  allowance,
  approve,
  claimTo as claimToERC20,
  decimals,
} from 'thirdweb/extensions/erc20';
import {
  buyFromListing,
  createListing,
  getAllValidListings,
} from 'thirdweb/extensions/marketplace';
import {
  claimTo,
  getNFTs,
  getOwnedNFTs,
  isApprovedForAll,
  setApprovalForAll,
} from 'thirdweb/extensions/erc1155';
import { catchError, from, map, of, switchMap, throwError } from 'rxjs';
import { RPCError } from '../interfaces/rpc-error';
import { SellData } from '../../features/marketplace/interfaces/sell-data';
import { Hex } from 'thirdweb/dist/types/utils/encoding/hex';
import { MarketplaceItem } from '../../features/marketplace/interfaces/marketplace-item';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class ThirdwebService {
  private logger = inject(LoggerService);
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

  getOwnedItems({ address }: Account) {
    return from(
      getOwnedNFTs({
        contract: this.items,
        address,
      })
    ).pipe(
      catchError(err => {
        this.logger.showErrorMessage(this.GET_OWNED_ITEMS_ERROR);
        return throwError(() => err);
      })
    );
  }
  claimStartingWeapon(account: Account, tokenId: bigint) {
    return from(
      sendAndConfirmTransaction({
        transaction: claimTo({
          contract: this.items,
          to: account.address,
          tokenId,
          quantity: 1n,
        }),
        account,
      })
    ).pipe(
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
  createListing(account: Account, { item, price }: SellData) {
    return from(
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
    ).pipe(
      catchError(err => {
        this.logger.showErrorMessage(this.CREATE_LISTING_ERROR);
        return throwError(() => err);
      })
    );
  }
  buyFromListing(account: Account, item: MarketplaceItem) {
    return this.approve(account, item).pipe(
      switchMap(() =>
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
  checkApproval(account: Account, item: MarketplaceItem) {
    return from(
      allowance({
        contract: this.gearcoin,
        owner: account.address,
        spender: this.marketplaceContract.address as Hex,
      })
    ).pipe(map(result => result < item.balance.value));
    // return from(
    //   isApprovedForAll({
    //     contract: this.items,
    //     owner: account.address,
    //     operator: this.marketplaceContract.address,
    //   })
    // ).pipe(
    //   switchMap(isApproved =>
    //     isApproved
    //       ? of(true)
    //       : sendAndConfirmTransaction({
    //           account,
    //           transaction: setApprovalForAll({
    //             contract: this.items,
    //             operator: this.marketplaceContract.address,
    //             approved: true,
    //           }),
    //         })
    //   ),
    //   catchError((err: RPCError) => {
    //     this.logger.showErrorMessage(this.getErrorMessage(err));
    //     return throwError(() => err);
    //   })
    // );
  }
  approve(account: Account, item: MarketplaceItem) {
    return from(
      decimals({
        contract: this.gearcoin,
      })
    ).pipe(
      switchMap(decimals =>
        sendAndConfirmTransaction({
          account,
          transaction: approve({
            contract: this.gearcoin,
            spender: this.marketplaceContract.address as Hex,
            amount: toTokens(item.balance.value, decimals),
          }),
        })
      )
    );
  }
  getBalance({ address }: Account) {
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
        return throwError(() => err);
      })
    );
  }
  claimGearcoin(account: Account, quantity: number) {
    const transaction = claimToERC20({
      contract: this.gearcoin,
      to: account.address,
      quantity: BigInt(quantity).toString(),
    });
    return from(sendAndConfirmTransaction({ transaction, account })).pipe(
      catchError((err: RPCError) => {
        this.logger.showErrorMessage(this.getErrorMessage(err));
        return throwError(() => err);
      })
    );
  }
  connect() {
    return from(this.metamask.connect({ client: this.client })).pipe(
      catchError((err: RPCError) => {
        this.logger.showErrorMessage(this.getErrorMessage(err));
        return throwError(() => err);
      })
    );
  }
  disconnect() {
    return from(this.metamask.disconnect()).pipe(
      catchError((err: RPCError) => {
        this.logger.showErrorMessage(this.getErrorMessage(err));
        return throwError(() => err);
      })
    );
  }
  autoConnect() {
    return from(this.metamask.autoConnect({ client: this.client })).pipe(
      catchError((err: RPCError) => {
        this.logger.showErrorMessage(this.getErrorMessage(err));
        return throwError(() => err);
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
