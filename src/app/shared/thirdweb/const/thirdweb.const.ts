import { createThirdwebClient } from 'thirdweb';
import { polygonAmoy } from 'thirdweb/chains';
import { createWallet } from 'thirdweb/wallets';
import { environment } from '../../../../environments/environment';

export class ThirdwebConstants {
  public static CHAIN = polygonAmoy;
  public static CLIENT = createThirdwebClient({
    clientId: environment.clientId,
    secretKey: environment.secretKey,
  });
  public static METAMASK = createWallet('io.metamask');
  public static LOOTBOX_TOKEN_ID = 2n;
  public static LOOTBOX_LISTING_ID = 2n;
}
