import { createThirdwebClient } from 'thirdweb';
import { polygonAmoy } from 'thirdweb/chains';
import { createWallet } from 'thirdweb/wallets';
import { environment } from '../../../../environments/environment';

export const THIRDWEB_CONSTANTS = {
  CHAIN: polygonAmoy,
  CLIENT: createThirdwebClient({
    clientId: environment.clientId,
    secretKey: environment.secretKey,
  }),
  METAMASK: createWallet('io.metamask'),
};
