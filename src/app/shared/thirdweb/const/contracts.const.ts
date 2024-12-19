import { getContract } from 'thirdweb';
import { environment } from '../../../../environments/environment';
import { ThirdwebConstants } from './thirdweb.const';

export class Contracts {
  public static GEARCOIN = getContract({
    client: ThirdwebConstants.CLIENT,
    chain: ThirdwebConstants.CHAIN,
    address: environment.gearcoin,
  });
  public static ITEMS = getContract({
    client: ThirdwebConstants.CLIENT,
    chain: ThirdwebConstants.CHAIN,
    address: environment.itemsAddress,
  });
  public static PACK_CONTRACT = getContract({
    client: ThirdwebConstants.CLIENT,
    chain: ThirdwebConstants.CHAIN,
    address: environment.packContract,
  });
  public static MARKETPLACE_CONTRACT = getContract({
    client: ThirdwebConstants.CLIENT,
    chain: ThirdwebConstants.CHAIN,
    address: environment.marketplace,
  });
  public static LOOTBOX_SHOP = getContract({
    client: ThirdwebConstants.CLIENT,
    chain: ThirdwebConstants.CHAIN,
    address: environment.lootboxShop,
  });
}
