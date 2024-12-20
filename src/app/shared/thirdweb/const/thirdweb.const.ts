import { createThirdwebClient } from 'thirdweb';
import { polygonAmoy } from 'thirdweb/chains';
import { createWallet } from 'thirdweb/wallets';
import { environment } from '../../../../environments/environment';

export class ThirdwebConstants {
  public static readonly CHAIN = polygonAmoy;
  public static readonly CLIENT = createThirdwebClient({
    clientId: environment.clientId,
    secretKey: environment.secretKey,
  });
  public static readonly METAMASK = createWallet('io.metamask');
}
