import { PAGE_SIZE } from './../constants/config.const';
import { Injectable, inject } from '@angular/core';
import {
  encode,
  parseEventLogs,
  prepareContractCall,
  PreparedTransaction,
  readContract,
  sendAndConfirmTransaction,
  sendTransaction,
  toTokens,
} from 'thirdweb';
import { Account, getWalletBalance } from 'thirdweb/wallets';
import {
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
  getNFT,
  getNFTs,
  getOwnedNFTs,
  lazyMint,
  packOpenedEvent,
  setClaimConditions,
  tokensLazyMintedEvent,
  updateMetadata,
} from 'thirdweb/extensions/erc1155';
import {
  createNewPack,
  ERC1155Reward,
  openPack,
  packCreatedEvent,
} from 'thirdweb/extensions/pack';

import {
  catchError,
  combineLatest,
  forkJoin,
  from,
  map,
  Observable,
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
import { UpdateItem } from './model/update-item.model';
import { ThirdwebConstants } from './const/thirdweb.const';
import { NFTMetadata } from 'thirdweb/dist/types/utils/nft/parseNft';
import { TransactionReceipt } from 'thirdweb/dist/types/transaction/types';

@Injectable({
  providedIn: 'root',
})
export class ThirdwebService {
  private logger = inject(LoggerService);
  private texts = Texts;
  private contracts = Contracts;
  private const = ThirdwebConstants;
  getTotalAmountOfItems() {
    return from(
      readContract({
        contract: this.contracts.ITEMS,
        method: 'function getBaseURICount() view returns (uint256)',
        params: [],
      })
    );
  }
  openPack(account: Account, id: bigint) {
    return from(
      sendAndConfirmTransaction({
        account,
        transaction: openPack({
          contract: this.contracts.PACK_CONTRACT,
          packId: id,
          amountToOpen: BigInt(1),
        }),
      })
    ).pipe(
      map(data => {
        const event = parseEventLogs({
          logs: data.logs,
          events: [packOpenedEvent()],
        });
        return event[0].args.rewardUnitsDistributed;
      })
    );
  }
  getOwnedPacks(account: Account) {
    return from(
      getOwnedNFTs({
        contract: this.contracts.PACK_CONTRACT,
        address: account.address,
      })
    ).pipe(
      catchError(err => {
        this.logger.showErrorMessage(this.texts.GET_OWNED_LOOTBOXES_ERROR);
        return throwError(() => err);
      })
    );
  }
  buyPack(account: Account, listingId: bigint, value: bigint) {
    return this.approveLootboxBuy(account, value).pipe(
      switchMap(() =>
        sendTransaction({
          account,
          transaction: buyFromListing({
            contract: this.contracts.LOOTBOX_SHOP,
            listingId,
            quantity: 1n,
            recipient: account.address,
          }),
        })
      ),
      catchError(err => {
        this.logger.showErrorMessage(this.texts.BUY_LOOTBOX_ERROR);
        return throwError(() => err);
      })
    );
  }
  getPacks() {
    return from(
      getAllValidListings({
        contract: this.contracts.LOOTBOX_SHOP,
      })
    ).pipe(
      catchError(err => {
        this.logger.showErrorMessage(this.texts.GET_LOOTBOXES_LISTINGS_ERROR);
        return throwError(() => err);
      })
    );
  }
  claimItems(
    account: Account,
    items: { tokenId: bigint; totalRewards: number }[]
  ) {
    let request: Observable<TransactionReceipt>;
    if (items.length > 1) {
      const contracts = items.map(i =>
        this.getClaimContract(account, i.tokenId, BigInt(i.totalRewards))
      );
      const encodedContracts = contracts.map(c => from(encode(c)));
      request = combineLatest(encodedContracts).pipe(
        switchMap(cs =>
          sendAndConfirmTransaction({
            account,
            transaction: prepareContractCall({
              contract: this.contracts.ITEMS,
              method:
                'function multicall(bytes[] data) returns (bytes[] results)',
              params: [cs],
            }),
          })
        )
      );
    } else {
      const { tokenId, totalRewards } = items[0];
      request = from(
        sendAndConfirmTransaction({
          transaction: this.getClaimContract(
            account,
            tokenId,
            BigInt(totalRewards)
          ),
          account,
        })
      );
    }
    return request.pipe(
      catchError(err => {
        this.logger.showErrorMessage(this.texts.CLAIM_ITEM_ERROR);
        return throwError(() => err);
      })
    );
  }
  private getClaimContract(
    account: Account,
    tokenId: bigint,
    quantity: bigint
  ) {
    return claimTo({
      contract: this.contracts.ITEMS,
      to: account.address,
      tokenId,
      quantity,
    });
  }
  addNewPack(
    account: Account,
    packMetaData: NFTMetadata,
    items: { tokenId: bigint; totalRewards: number }[]
  ) {
    const erc1155Rewards = items.map(
      i =>
        ({
          ...i,
          contractAddress: this.contracts.ITEMS.address,
          quantityPerReward: 1,
        } as ERC1155Reward)
    );
    return from(
      sendAndConfirmTransaction({
        account,
        transaction: createNewPack({
          contract: this.contracts.PACK_CONTRACT,
          client: this.const.CLIENT,
          recipient: account.address,
          tokenOwner: account.address,
          packMetadata: packMetaData,
          amountDistributedPerOpen: 1n,
          openStartTimestamp: new Date(),
          erc1155Rewards,
        }),
      })
    ).pipe(
      map(data => {
        const event = parseEventLogs({
          logs: data.logs,
          events: [packCreatedEvent()],
        });
        return {
          packId: event[0].args.packId,
          quantity: event[0].args.totalPacksCreated,
        };
      })
    );
  }
  createPackListing(
    account: Account,
    tokenId: bigint,
    quantity: bigint,
    price: number
  ) {
    return from(
      sendAndConfirmTransaction({
        account,
        transaction: createListing({
          contract: this.contracts.LOOTBOX_SHOP,
          assetContractAddress: this.contracts.PACK_CONTRACT.address,
          tokenId,
          quantity,
          pricePerToken: price.toString(),
          currencyContractAddress: this.contracts.GEARCOIN.address,
        }),
      })
    );
  }
  updateItem(account: Account, id: bigint, item: UpdateItem) {
    if (item.newImage) {
      return this.uploadImage(item.newImage).pipe(
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
    return this.uploadImage(item.image).pipe(
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
        return this.setClaimConditions(account, tokenId);
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
  getBalance({ address }: Account) {
    return from(
      getWalletBalance({
        client: this.const.CLIENT,
        chain: this.const.CHAIN,
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
      this.const.METAMASK.connect({ client: this.const.CLIENT })
    ).pipe(
      catchError((err: RPCError) => {
        this.logger.showErrorMessage(this.getErrorMessage(err));
        return throwError(() => err);
      })
    );
  }
  disconnect() {
    return from(this.const.METAMASK.disconnect()).pipe(
      catchError((err: RPCError) => {
        this.logger.showErrorMessage(this.getErrorMessage(err));
        return throwError(() => err);
      })
    );
  }
  autoConnect() {
    return from(
      this.const.METAMASK.autoConnect({ client: this.const.CLIENT })
    ).pipe(
      catchError((err: Error) => {
        if (err.message.includes('no accounts available')) return of(undefined);
        this.logger.showErrorMessage(this.getErrorMessage(err as RPCError));
        return throwError(() => err);
      })
    );
  }
  uploadImage(image: File) {
    return from(
      upload({
        client: this.const.CLIENT,
        files: [image],
      })
    ).pipe(
      catchError(err => {
        this.logger.showErrorMessage(this.texts.UPLOAD_IMAGE_ERROR);
        return throwError(() => err);
      })
    );
  }
  private approve(account: Account, item: MarketplaceItem) {
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
  private approveLootboxBuy(account: Account, value: bigint) {
    return from(decimals({ contract: this.contracts.GEARCOIN })).pipe(
      switchMap(decimals =>
        sendAndConfirmTransaction({
          account,
          transaction: approve({
            contract: this.contracts.GEARCOIN,
            spender: this.contracts.LOOTBOX_SHOP.address as Hex,
            amount: toTokens(value, decimals),
          }),
        })
      )
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
        this.logger.showErrorMessage(this.texts.UPDATE_ITEM_ERROR);
        return throwError(() => err);
      })
    );
  }
  private setClaimConditions(account: Account, tokenId: bigint) {
    const transaction = setClaimConditions({
      contract: this.contracts.ITEMS,
      tokenId,
      phases: [
        {
          metadata: {
            name: 'Public phase',
          },
          startTime: new Date(),
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
