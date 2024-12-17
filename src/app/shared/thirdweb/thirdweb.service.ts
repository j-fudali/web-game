import { Injectable, inject } from '@angular/core';
import {
  parseEventLogs,
  sendAndConfirmTransaction,
  ThirdwebClient,
  toTokens,
} from 'thirdweb';
import { Account, getWalletBalance } from 'thirdweb/wallets';
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
  lazyMint,
  setClaimConditions,
  tokensLazyMintedEvent,
} from 'thirdweb/extensions/erc1155';
import {
  catchError,
  EMPTY,
  from,
  map,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { upload } from 'thirdweb/storage';

import { RPCError } from '../interfaces/rpc-error';
import { SellData } from '../../features/marketplace/interfaces/sell-data';
import { Hex } from 'thirdweb/dist/types/utils/encoding/hex';
import { MarketplaceItem } from '../../features/marketplace/interfaces/marketplace-item';
import { LoggerService } from '../services/logger.service';
import { NewItem } from './model/new-item.model';
import { Contracts } from './const/contracts.const';
import { Texts } from './texts/texts.const';

@Injectable({
  providedIn: 'root',
})
export class ThirdwebService {
  private logger = inject(LoggerService);
  private texts = Texts;
  private contracts = Contracts;

  createItem(account: Account, item: NewItem) {
    return this.uploadImage(this.contracts.CLIENT, item.image).pipe(
      switchMap(image =>
        from(
          sendAndConfirmTransaction({
            account,
            transaction: this.getNewItemTransaction(item, image),
          })
        ).pipe(
          tap(() =>
            this.logger.showSuccessMessage(this.texts.ADD_NEW_ITEM_SUCCESS)
          ),
          catchError(err => {
            this.logger.showErrorMessage(this.texts.ADD_NEW_ITEM_ERROR);
            return throwError(() => err);
          })
        )
      ),
      switchMap(data => {
        const event = parseEventLogs({
          logs: data.logs,
          events: [tokensLazyMintedEvent()],
        });
        const tokenId = event[0].args.startTokenId;
        return this.setClaimConditions(
          account,
          tokenId,
          BigInt(item.amountToClaim)
        );
      })
    );
  }
  getOwnedItems({ address }: Account) {
    return from(
      getOwnedNFTs({
        contract: this.contracts.ITEMS,
        address,
      })
    ).pipe(
      catchError(err => {
        this.logger.showErrorMessage(this.texts.GET_OWNED_ITEMS_ERROR);
        return throwError(() => err);
      })
    );
  }
  claimStartingWeapon(account: Account, tokenId: bigint) {
    return from(
      sendAndConfirmTransaction({
        transaction: claimTo({
          contract: this.contracts.ITEMS,
          to: account.address,
          tokenId,
          quantity: 1n,
        }),
        account,
      })
    ).pipe(
      catchError(err => {
        this.logger.showErrorMessage(this.texts.CLAIM_STARTING_WEAPON_ERROR);
        return throwError(() => err);
      })
    );
  }
  getListings() {
    return from(
      getAllValidListings({ contract: this.contracts.MARKETPLACE_CONTRACT })
    ).pipe(
      catchError(err => {
        this.logger.showErrorMessage(this.texts.GET_LISTINGS_ERROR);
        return throwError(() => err);
      })
    );
  }
  createListing(account: Account, { item, price }: SellData) {
    return from(
      sendAndConfirmTransaction({
        account,
        transaction: createListing({
          contract: this.contracts.MARKETPLACE_CONTRACT,
          assetContractAddress: this.contracts.ITEMS.address,
          tokenId: item.tokenId,
          quantity: 1n,
          pricePerToken: price.toString(),
          currencyContractAddress: this.contracts.GEARCOIN.address,
        }),
      })
    ).pipe(
      catchError(err => {
        this.logger.showErrorMessage(this.texts.CREATE_LISTING_ERROR);
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
            contract: this.contracts.MARKETPLACE_CONTRACT,
            listingId: item.listingId,
            quantity: 1n,
            recipient: account.address,
          }),
        })
      ),
      catchError((err: Error) => {
        this.logger.showErrorMessage(this.texts.BUY_FROM_LISTING_ERROR);
        return throwError(() => err);
      })
    );
  }
  getStartingItems() {
    return from(getNFTs({ contract: this.contracts.ITEMS })).pipe(
      catchError(err => {
        this.logger.showErrorMessage(this.texts.GET_STARTING_WEAPON_ERROR);
        return throwError(() => err);
      })
    );
  }
  checkApproval(account: Account, item: MarketplaceItem) {
    return from(
      allowance({
        contract: this.contracts.GEARCOIN,
        owner: account.address,
        spender: this.contracts.MARKETPLACE_CONTRACT.address as Hex,
      })
    ).pipe(map(result => result < item.balance.value));
  }
  approve(account: Account, item: MarketplaceItem) {
    return from(
      decimals({
        contract: this.contracts.GEARCOIN,
      })
    ).pipe(
      switchMap(decimals =>
        sendAndConfirmTransaction({
          account,
          transaction: approve({
            contract: this.contracts.GEARCOIN,
            spender: this.contracts.MARKETPLACE_CONTRACT.address as Hex,
            amount: toTokens(item.balance.value, decimals),
          }),
        })
      )
    );
  }
  getBalance({ address }: Account) {
    return from(
      getWalletBalance({
        client: this.contracts.CLIENT,
        chain: this.contracts.CHAIN,
        address,
        tokenAddress: this.contracts.GEARCOIN.address,
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
      contract: this.contracts.GEARCOIN,
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
    return from(
      this.contracts.METAMASK.connect({ client: this.contracts.CLIENT })
    ).pipe(
      catchError((err: RPCError) => {
        this.logger.showErrorMessage(this.getErrorMessage(err));
        return throwError(() => err);
      })
    );
  }
  disconnect() {
    return from(this.contracts.METAMASK.disconnect()).pipe(
      catchError((err: RPCError) => {
        this.logger.showErrorMessage(this.getErrorMessage(err));
        return throwError(() => err);
      })
    );
  }
  autoConnect() {
    return from(
      this.contracts.METAMASK.autoConnect({ client: this.contracts.CLIENT })
    ).pipe(
      catchError((err: Error) => {
        if (err.message.includes('no accounts available')) return of(undefined);
        this.logger.showErrorMessage(this.getErrorMessage(err as RPCError));
        return throwError(() => err);
      })
    );
  }
  private setClaimConditions(
    account: Account,
    tokenId: bigint,
    maxSupply: bigint
  ) {
    const transaction = setClaimConditions({
      contract: this.contracts.ITEMS,
      tokenId,
      phases: [
        {
          metadata: {
            name: 'Public phase',
          },
          startTime: new Date(),
          maxClaimableSupply: maxSupply,
        },
      ],
    });
    return from(
      sendAndConfirmTransaction({
        account,
        transaction,
      })
    ).pipe(
      tap(() =>
        this.logger.showSuccessMessage(this.texts.SET_CONDITIONS_SUCCESS)
      ),
      catchError(err => {
        this.logger.showErrorMessage(this.texts.SET_CONDITIONS_ERROR);
        return throwError(() => err);
      })
    );
  }
  private uploadImage(client: ThirdwebClient, image: File) {
    return from(
      upload({
        client,
        files: [image],
      })
    ).pipe(
      catchError(err => {
        this.logger.showErrorMessage(this.texts.UPLOAD_IMAGE_ERROR);
        return throwError(() => err);
      })
    );
  }
  private getNewItemTransaction(item: NewItem, image: string) {
    const properties: Record<string, unknown> = {
      classType: item.classType,
      type: item.type,
    };
    if (item.damage) properties['damage'] = item.damage;
    if (item.armor) properties['armor'] = item.armor;
    if (item.armor && item.bodySlot) properties['bodySlot'] = item.bodySlot;
    return lazyMint({
      contract: this.contracts.ITEMS,
      nfts: [
        {
          name: item.name,
          description: item.description,
          image,
          properties,
        },
      ],
    });
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
