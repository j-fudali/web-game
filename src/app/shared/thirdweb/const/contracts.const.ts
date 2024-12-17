import { createThirdwebClient, getContract } from 'thirdweb';
import { polygonAmoy } from 'thirdweb/chains';
import { createWallet } from 'thirdweb/wallets';
import { environment } from '../../../../environments/environment';

export class Contracts {
  public static CHAIN = polygonAmoy;

  public static CLIENT = createThirdwebClient({
    clientId: environment.clientId,
    secretKey: environment.secretKey,
  });
  public static METAMASK = createWallet('io.metamask');
  public static GEARCOIN = getContract({
    client: this.CLIENT,
    chain: this.CHAIN,
    address: environment.gearcoin,
  });
  public static ITEMS = getContract({
    client: this.CLIENT,
    chain: this.CHAIN,
    address: environment.itemsAddress,
  });
  public static PACK_CONTRACT = getContract({
    client: this.CLIENT,
    chain: this.CHAIN,
    address: environment.packContract,
  });
  public static MARKETPLACE_CONTRACT = getContract({
    client: this.CLIENT,
    chain: this.CHAIN,
    address: environment.marketplace,
  });
}
