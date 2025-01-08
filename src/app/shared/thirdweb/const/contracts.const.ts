import { getContract } from 'thirdweb';
import { environment } from '../../../../environments/environment';
import { THIRDWEB_CONSTANTS } from './thirdweb.const';

export const CONTRACTS = {
  GEARCOIN: getContract({
    client: THIRDWEB_CONSTANTS.CLIENT,
    chain: THIRDWEB_CONSTANTS.CHAIN,
    address: environment.gearcoin,
  }),
  STARTING_ITEMS: getContract({
    client: THIRDWEB_CONSTANTS.CLIENT,
    chain: THIRDWEB_CONSTANTS.CHAIN,
    address: environment.startingItems,
  }),
  ITEMS: getContract({
    client: THIRDWEB_CONSTANTS.CLIENT,
    chain: THIRDWEB_CONSTANTS.CHAIN,
    address: environment.itemsAddress,
  }),
  PACK_CONTRACT: getContract({
    client: THIRDWEB_CONSTANTS.CLIENT,
    chain: THIRDWEB_CONSTANTS.CHAIN,
    address: environment.packContract,
  }),
  MARKETPLACE_CONTRACT: getContract({
    client: THIRDWEB_CONSTANTS.CLIENT,
    chain: THIRDWEB_CONSTANTS.CHAIN,
    address: environment.marketplace,
  }),
  LOOTBOX_SHOP: getContract({
    client: THIRDWEB_CONSTANTS.CLIENT,
    chain: THIRDWEB_CONSTANTS.CHAIN,
    address: environment.lootboxShop,
  }),
};
