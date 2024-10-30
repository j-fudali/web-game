import { GetBalanceResult } from "thirdweb/extensions/erc20";
import { Item } from "../../../shared/interfaces/item";

export interface MarketplaceItem extends Item {
    listingId: bigint;
    balance: GetBalanceResult
    creatorAddress?: string
}
