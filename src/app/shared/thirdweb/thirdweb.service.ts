import { PAGE_SIZE } from './../constants/config.const';
import { Injectable, NgZone, inject } from '@angular/core';
import {
  ContractOptions,
  encode,
  parseEventLogs,
  prepareContractCall,
  readContract,
  sendAndConfirmTransaction,
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
  getAllListings,
  getAllValidListings,
  totalListings,
} from 'thirdweb/extensions/marketplace';
import {
  claimTo,
  getNFT,
  getNFTs,
  getOwnedNFTs,
  isApprovedForAll,
  lazyMint,
  packOpenedEvent,
  setApprovalForAll,
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
  BehaviorSubject,
  catchError,
  combineLatest,
  EMPTY,
  filter,
  finalize,
  from,
  map,
  merge,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { upload } from 'thirdweb/storage';
import { RPCError } from '../interfaces/rpc-error';
import { SellData } from '../../features/marketplace/interfaces/sell-data';
import { Hex } from 'thirdweb/dist/types/utils/encoding/hex';
import { MarketplaceItem } from '../../features/marketplace/interfaces/marketplace-item';
import { LoggerService } from '../services/logger.service';
import { NewItem } from './model/new-item.model';
import { UpdateItem } from './model/update-item.model';
import { NFT, NFTMetadata } from 'thirdweb/dist/types/utils/nft/parseNft';
import { TransactionReceipt } from 'thirdweb/dist/types/transaction/types';
import { TEXTS } from './texts/texts.const';
import { THIRDWEB_CONSTANTS } from './const/thirdweb.const';
import { CONTRACTS } from './const/contracts.const';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoaderService } from '../features/loader/loader.service';

@Injectable({
  providedIn: 'root',
})
export class ThirdwebService {
  private zone = inject(NgZone);
  private logger = inject(LoggerService);
  private loaderService = inject(LoaderService);
  private texts = TEXTS;
  private contracts = CONTRACTS;
  private const = THIRDWEB_CONSTANTS;
  private refreshAccount$ = new Subject<void>();
  private account$ = new BehaviorSubject<Account>(
    THIRDWEB_CONSTANTS.METAMASK.getAccount() || ({} as Account)
  );
  private isDiconnected$ = new BehaviorSubject<boolean>(
    !localStorage.getItem('isDisconnected') ||
      localStorage.getItem('isDisconnected') === 'true'
  );
  constructor() {
    merge(
      this.refreshAccount$.pipe(
        map(() => THIRDWEB_CONSTANTS.METAMASK.getAccount() as Account)
      ),
      this.listenToAccountChanges()
    )
      .pipe(takeUntilDestroyed())
      .subscribe(acc => {
        this.zone.run(() => this.account$.next(acc));
      });
  }
  getIsDisconnected$() {
    return this.isDiconnected$.asObservable();
  }
  getIsDisconnected() {
    return this.isDiconnected$.getValue();
  }
  getAccount$(): Observable<Account> {
    return this.account$.pipe(
      filter(acc => Object.keys(acc).length > 0),
      map(acc => acc as Account)
    );
  }
  getTotalAmountOfItems() {
    return from(
      readContract({
        contract: this.contracts.ITEMS,
        method: 'function getBaseURICount() view returns (uint256)',
        params: [],
      })
    );
  }
  openPack(id: bigint) {
    const account = this.account$.getValue();
    this.loaderService.show();
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
      switchMap(data => {
        const event = parseEventLogs({
          logs: data.logs,
          events: [packOpenedEvent()],
        });
        const reward = event[0].args.rewardUnitsDistributed[0];
        return this.getItemById(reward.tokenId);
      }),
      catchError(() => {
        this.logger.showErrorMessage(this.texts.OPEN_PACK_ERROR);
        return EMPTY;
      }),
      finalize(() => this.loaderService.hide())
    );
  }
  getOwnedPacks(page: number) {
    this.loaderService.show();
    return this.getAccount$().pipe(
      switchMap(account =>
        from(
          getOwnedNFTs({
            contract: this.contracts.PACK_CONTRACT,
            address: account.address,
            start: page * PAGE_SIZE,
            count: PAGE_SIZE,
          })
        ).pipe(
          catchError(() => {
            this.logger.showErrorMessage(this.texts.GET_OWNED_LOOTBOXES_ERROR);
            return EMPTY;
          }),
          finalize(() => this.loaderService.hide())
        )
      )
    );
  }
  buyPack(listingId: bigint, value: bigint) {
    const account = this.account$.getValue();
    this.loaderService.show();
    return this.approveLootboxBuy(account, value).pipe(
      switchMap(() =>
        sendAndConfirmTransaction({
          account,
          transaction: buyFromListing({
            contract: this.contracts.LOOTBOX_SHOP,
            listingId,
            quantity: 1n,
            recipient: account.address,
          }),
        })
      ),
      tap(() => this.refreshAccount()),
      catchError(() => {
        this.logger.showErrorMessage(this.texts.BUY_LOOTBOX_ERROR);
        return EMPTY;
      }),
      finalize(() => this.loaderService.hide())
    );
  }
  getTotalPacksListings() {
    return from(
      totalListings({
        contract: this.contracts.LOOTBOX_SHOP,
      })
    );
  }
  getPacks() {
    this.loaderService.show();
    return from(
      getAllValidListings({
        contract: this.contracts.LOOTBOX_SHOP,
      })
    ).pipe(
      catchError(() => {
        this.logger.showErrorMessage(this.texts.GET_LOOTBOXES_LISTINGS_ERROR);
        return EMPTY;
      }),
      finalize(() => this.loaderService.hide())
    );
  }
  claimItems(items: { tokenId: bigint; totalRewards: number }[]) {
    const account = this.account$.getValue();
    let request: Observable<TransactionReceipt>;
    if (items.length > 1) {
      const contracts = items.map(i =>
        this.getClaimContract(account, i.tokenId, BigInt(i.totalRewards))
      );
      const encodedContracts = contracts.map(contract =>
        from(encode(contract))
      );
      request = combineLatest(encodedContracts).pipe(
        switchMap(contracts =>
          sendAndConfirmTransaction({
            account,
            transaction: prepareContractCall({
              contract: this.contracts.ITEMS,
              method:
                'function multicall(bytes[] data) returns (bytes[] results)',
              params: [contracts],
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
      catchError(() => {
        this.logger.showErrorMessage(this.texts.CLAIM_ITEM_ERROR);
        return EMPTY;
      })
    );
  }
  addNewPack(
    packMetaData: NFTMetadata,
    items: { tokenId: bigint; totalRewards: number }[]
  ) {
    const account = this.account$.getValue();
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
      }),
      catchError(() => {
        this.logger.showErrorMessage(this.texts.ADD_NEW_PACK_ERROR);
        return EMPTY;
      })
    );
  }
  createPackListing(tokenId: bigint, quantity: bigint, price: number) {
    const account = this.account$.getValue();
    return this.areContractApprovedForListing(
      account,
      this.contracts.PACK_CONTRACT,
      this.contracts.LOOTBOX_SHOP.address
    ).pipe(
      switchMap(isApproved =>
        isApproved
          ? of(null)
          : this.approveContractForListing(
              account,
              this.contracts.PACK_CONTRACT,
              this.contracts.LOOTBOX_SHOP.address
            )
      ),
      switchMap(() =>
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
      ),
      tap(() =>
        this.logger.showSuccessMessage(this.texts.CREATE_PACK_LISTING_SUCCESS)
      ),
      catchError(() => {
        this.logger.showErrorMessage(this.texts.CREATE_PACK_LISTING_ERROR);
        return EMPTY;
      })
    );
  }
  updateItem(id: bigint, item: UpdateItem) {
    const account = this.account$.getValue();
    this.loaderService.show();
    if (item.newImage) {
      return this.uploadImage(item.newImage).pipe(
        switchMap(image =>
          this.getUpdateItemTransaction(account, id, item, image)
        ),
        finalize(() => this.loaderService.hide())
      );
    }
    return this.getUpdateItemTransaction(account, id, item, item.oldImage).pipe(
      finalize(() => this.loaderService.hide())
    );
  }
  getItemById(id: bigint): Observable<NFT>;
  getItemById(id: number): Observable<NFT>;
  getItemById(id: number | bigint): Observable<NFT> {
    this.loaderService.show();
    return from(
      getNFT({
        contract: this.contracts.ITEMS,
        tokenId: typeof id === 'bigint' ? id : BigInt(id),
      })
    ).pipe(
      catchError(() => {
        this.logger.showErrorMessage(this.texts.GET_ITEM_ERROR);
        return EMPTY;
      }),
      finalize(() => this.loaderService.hide())
    );
  }
  getAllItems(page: number) {
    this.loaderService.show();
    return from(
      getNFTs({
        contract: this.contracts.ITEMS,
        start: page * PAGE_SIZE,
        count: PAGE_SIZE,
      })
    ).pipe(
      catchError(() => {
        this.logger.showErrorMessage(this.texts.GET_ITEMS_ERROR);
        return EMPTY;
      }),
      finalize(() => this.loaderService.hide())
    );
  }
  createItem(item: NewItem) {
    return combineLatest([
      this.uploadImage(item.image),
      this.getAccount$(),
    ]).pipe(
      switchMap(([image, account]) =>
        from(
          sendAndConfirmTransaction({
            account,
            transaction: this.getNewItemTransaction(item, image),
          })
        ).pipe(
          map(data => ({ data, account })),
          tap(() =>
            this.logger.showSuccessMessage(this.texts.ADD_NEW_ITEM_SUCCESS)
          ),
          catchError(() => {
            this.logger.showErrorMessage(this.texts.ADD_NEW_ITEM_ERROR);
            return EMPTY;
          })
        )
      ),
      switchMap(({ data, account }) => {
        const event = parseEventLogs({
          logs: data.logs,
          events: [tokensLazyMintedEvent()],
        });
        const tokenId = event[0].args.startTokenId;
        return this.setClaimConditions(account, tokenId);
      })
    );
  }
  getOwnedItems() {
    return this.getAccount$().pipe(
      switchMap(account =>
        getOwnedNFTs({
          contract: this.contracts.ITEMS,
          address: account.address,
        })
      ),
      catchError(() => {
        this.logger.showErrorMessage(this.texts.GET_OWNED_ITEMS_ERROR);
        return EMPTY;
      })
    );
  }
  claimStartingWeapon(tokenId: bigint) {
    const account = this.account$.getValue();
    this.loaderService.show();
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
      catchError(() => {
        this.logger.showErrorMessage(this.texts.CLAIM_STARTING_WEAPON_ERROR);
        return EMPTY;
      }),
      finalize(() => this.loaderService.hide())
    );
  }
  getListings() {
    return from(
      getAllValidListings({ contract: this.contracts.MARKETPLACE_CONTRACT })
    ).pipe(
      catchError(() => {
        this.logger.showErrorMessage(this.texts.GET_LISTINGS_ERROR);
        return EMPTY;
      })
    );
  }
  createListing({ item, price }: SellData) {
    const account = this.account$.getValue();
    this.loaderService.show();
    return this.areContractApprovedForListing(
      account,
      this.contracts.ITEMS,
      this.contracts.MARKETPLACE_CONTRACT.address
    ).pipe(
      switchMap(isApproved =>
        isApproved
          ? of(null)
          : this.approveContractForListing(
              account,
              this.contracts.ITEMS,
              this.contracts.MARKETPLACE_CONTRACT.address
            )
      ),
      switchMap(() =>
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
      ),
      tap(() => {
        this.logger.showSuccessMessage(this.texts.CREATE_LISTING_SUCCESS);
      }),
      catchError(err => {
        console.log(err);
        this.logger.showErrorMessage(this.texts.CREATE_LISTING_ERROR);
        return EMPTY;
      }),
      finalize(() => this.loaderService.hide())
    );
  }
  buyFromListing(item: MarketplaceItem) {
    this.loaderService.show();
    const account = this.account$.getValue();
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
      tap(() => {
        this.refreshAccount();
        this.logger.showSuccessMessage(this.texts.BUY_FROM_LISTING_SUCCESS);
      }),
      catchError(() => {
        this.logger.showErrorMessage(this.texts.BUY_FROM_LISTING_ERROR);
        return EMPTY;
      }),
      finalize(() => this.loaderService.hide())
    );
  }
  getStartingItems() {
    return from(
      getNFTs({ contract: this.contracts.ITEMS, start: 3, count: 3 })
    ).pipe(
      catchError(() => {
        this.logger.showErrorMessage(this.texts.GET_STARTING_WEAPONS_ERROR);
        return EMPTY;
      })
    );
  }
  getBalance() {
    return this.getAccount$().pipe(
      switchMap(acc => {
        return from(
          getWalletBalance({
            client: this.const.CLIENT,
            chain: this.const.CHAIN,
            address: acc.address,
            tokenAddress: this.contracts.GEARCOIN.address,
          })
        ).pipe(
          catchError((err: RPCError) => {
            this.logger.showErrorMessage(this.getErrorMessage(err));
            return EMPTY;
          })
        );
      })
    );
  }
  claimGearcoin(quantity: number) {
    const account = this.account$.getValue();
    this.loaderService.show();
    return from(
      sendAndConfirmTransaction({
        transaction: claimToERC20({
          contract: this.contracts.GEARCOIN,
          to: account.address,
          quantity: BigInt(quantity).toString(),
        }),
        account,
      })
    ).pipe(
      tap(() => this.refreshAccount()),
      catchError(err => {
        this.logger.showErrorMessage(this.texts.CLAIM_GEARION_ERROR);
        return EMPTY;
      }),
      finalize(() => this.loaderService.hide())
    );
  }
  connect() {
    return from(
      this.const.METAMASK.connect({ client: this.const.CLIENT })
    ).pipe(
      tap(() => {
        localStorage.setItem('isDisconnected', 'false');
        this.isDiconnected$.next(false);
      }),
      catchError(c => {
        this.logger.showErrorMessage(TEXTS.CONNECT_ERROR);
        localStorage.removeItem('isDisconnected');
        return EMPTY;
      })
    );
  }
  disconnect() {
    return from(this.const.METAMASK.disconnect()).pipe(
      tap(() => {
        localStorage.setItem('isDisconnected', 'true');
        this.isDiconnected$.next(true);
      }),
      catchError(() => {
        this.logger.showErrorMessage(TEXTS.DISCONNECT_ERROR);
        localStorage.removeItem('isDisconnected');
        return EMPTY;
      })
    );
  }
  autoConnect() {
    return from(
      this.const.METAMASK.autoConnect({ client: this.const.CLIENT })
    ).pipe(
      tap(account => {
        this.account$.next(account);
      }),
      catchError((err: Error) => {
        localStorage.removeItem('isDisconnected');
        if (err.message.includes('no accounts available')) return EMPTY;
        this.logger.showErrorMessage(TEXTS.AUTOCONNECT_ERROR);
        return EMPTY;
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
      catchError(() => {
        this.logger.showErrorMessage(this.texts.UPLOAD_IMAGE_ERROR);
        return EMPTY;
      })
    );
  }
  private refreshAccount() {
    this.refreshAccount$.next();
  }
  private listenToAccountChanges() {
    return new Observable<Account>(subscriber =>
      THIRDWEB_CONSTANTS.METAMASK.subscribe('accountChanged', acc => {
        subscriber.next(acc);
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
    image?: string
  ) {
    const properties = this.mapItemProperties(item);
    return from(
      sendAndConfirmTransaction({
        account,
        transaction: updateMetadata({
          contract: this.contracts.ITEMS,
          targetTokenId: id,
          newMetadata: {
            name: item.name,
            description: item.description,
            image,
            properties,
          },
        }),
      })
    ).pipe(
      tap(() => this.logger.showSuccessMessage(this.texts.UPDATE_ITEM_SUCCESS)),
      catchError(err => {
        console.log(err);
        this.logger.showErrorMessage(this.texts.UPDATE_ITEM_ERROR);
        return EMPTY;
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
        return EMPTY;
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
  private areContractApprovedForListing(
    account: Account,
    contract: Readonly<ContractOptions<[]>>,
    operator: string
  ) {
    return from(
      isApprovedForAll({
        contract,
        owner: account.address,
        operator,
      })
    );
  }
  private approveContractForListing(
    account: Account,
    contract: Readonly<ContractOptions<[]>>,
    operator: string
  ) {
    return from(
      sendAndConfirmTransaction({
        account,
        transaction: setApprovalForAll({
          contract,
          operator,
          approved: true,
        }),
      })
    ).pipe(
      catchError(() => {
        this.logger.showErrorMessage(this.texts.APPROVING_ERROR);
        return EMPTY;
      })
    );
  }
  private getErrorMessage(err: RPCError) {
    switch (err.code) {
      case 4001:
        return this.texts.CONNECTION_REJECTED;
      case -32002:
        return this.texts.ACCEPT_CONNECTION;
      case -32603:
        return this.texts.INTERNAL_METAMASK;
      default:
        return this.texts.CANNOT_CONNECT;
    }
  }
}
