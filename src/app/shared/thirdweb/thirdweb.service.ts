import { PAGE_SIZE } from './../constants/config.const';
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
  getClaimConditions,
  getNFT,
  getNFTs,
  getOwnedNFTs,
  lazyMint,
  setClaimConditions,
  tokensLazyMintedEvent,
  updateMetadata,
} from 'thirdweb/extensions/erc1155';
import { catchError, from, map, of, switchMap, tap, throwError } from 'rxjs';
import { upload } from 'thirdweb/storage';
import { RPCError } from '../interfaces/rpc-error';
import { SellData } from '../../features/marketplace/interfaces/sell-data';
import { Hex } from 'thirdweb/dist/types/utils/encoding/hex';
import { MarketplaceItem } from '../../features/marketplace/interfaces/marketplace-item';
import { LoggerService } from '../services/logger.service';
import { NewItem } from './model/new-item.model';
import { Contracts } from './const/contracts.const';
import { Texts } from './texts/texts.const';
import { ClaimCondition } from 'thirdweb/dist/types/utils/extensions/drops/types';
import { UpdateItem } from './model/update-item.model';
import { ItemMapper } from '../utils/item-mapper';

@Injectable({
  providedIn: 'root',
})
export class ThirdwebService {
  private logger = inject(LoggerService);
  private texts = Texts;
  private contracts = Contracts;

  getClaimConditionMaxClaimableSupply(id: number) {
    return from(
      getClaimConditions({
        contract: this.contracts.ITEMS,
        tokenId: BigInt(id),
      })
    ).pipe(
      catchError(err => {
        this.logger.showErrorMessage(
          this.texts.GET_CLAIM_CONDITION_MAX_CLAIMABLE_SUPPLY
        );
        return throwError(() => err);
      })
    );
  }
  updateClaimCondition(
    account: Account,
    claimCondition: ClaimCondition,
    maxSupplyToClaim: number
  ) {
    return from(
      sendAndConfirmTransaction({
        account,
        transaction: setClaimConditions({
          contract: this.contracts.ITEMS,
          tokenId: 0n,
          phases: [
            { ...claimCondition, maxClaimableSupply: BigInt(maxSupplyToClaim) },
          ],
        }),
      })
    ).pipe(
      catchError(err => {
        this.logger.showErrorMessage(this.texts.UPDATE_CLAIM_CONDITION);
        return throwError(() => err);
      })
    );
  }

  updateItem(account: Account, id: bigint, item: UpdateItem) {
    console.log(item);
    if (item.newImage) {
      return this.uploadImage(this.contracts.CLIENT, item.newImage).pipe(
        switchMap(image =>
          this.getUpdateItemTransaction(account, id, item, image)
        )
      );
    }
    return this.getUpdateItemTransaction(account, id, item);
  }

  getItemById(id: number) {
    return from(
      getNFT({
        contract: this.contracts.ITEMS,
        tokenId: BigInt(id),
      })
    ).pipe(
      catchError(err => {
        this.logger.showErrorMessage(this.texts.GET_ITEM_ERROR);
        return throwError(() => err);
      })
    );
  }
  getAllItems(page: number) {
    return from(
      getNFTs({
        contract: this.contracts.ITEMS,
        start: page * PAGE_SIZE,
        count: PAGE_SIZE,
      })
    ).pipe(
      catchError(err => {
        this.logger.showErrorMessage(this.texts.GET_ITEMS_ERROR);
        return throwError(() => err);
      })
    );
  }
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
  private getUpdateItemTransaction(
    account: Account,
    id: bigint,
    item: UpdateItem,
    newImage?: string
  ) {
    const properties = this.mapItemProperties(item);
    return from(
      sendAndConfirmTransaction({
        account,
        transaction: updateMetadata({
          contract: this.contracts.ITEMS,
          targetTokenId: id,
          newMetadata: newImage
            ? {
                name: item.name,
                description: item.description,
                image: newImage,
                properties,
              }
            : { name: item.name, description: item.description, properties },
        }),
      })
    ).pipe(
      tap(() => this.logger.showSuccessMessage(this.texts.UPDATE_ITEM_SUCCESS)),
      catchError(err => {
        console.log(err);
        this.logger.showErrorMessage(this.texts.UPDATE_ITEM_ERROR);
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
    return lazyMint({
      contract: this.contracts.ITEMS,
      nfts: [
        {
          name: item.name,
          description: item.description,
          image,
          properties: this.mapItemProperties(item),
        },
      ],
    });
  }
  private mapItemProperties(item: Partial<NewItem>) {
    const properties: Array<Record<string, unknown>> = [
      { trait_type: 'classType', value: item.classType },
      { trait_type: 'type', value: item.type },
    ];

    if (item.damage)
      properties.push({ trait_type: 'damage', value: item.damage });
    if (item.armor) properties.push({ trait_type: 'armor', value: item.armor });
    if (item.armor && item.bodySlot)
      properties.push({ trait_type: 'bodySlot', value: item.bodySlot });
    return properties;
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
