import { createThirdwebClient, getContract } from 'thirdweb';
import { polygonAmoy } from 'thirdweb/chains';
import { createWallet } from 'thirdweb/wallets';
import { environment } from '../../../environments/environment.development';

export const chain = polygonAmoy;
export const client = createThirdwebClient({
  clientId: environment.clientId,
});
export const startingWeapons = getContract({
  client,
  chain,
  address: environment.startingWeaponsAddress,
});

const packContract = getContract({
  client,
  chain,
  address: environment.packContract,
});

export const metamask = createWallet('io.metamask');
export const gearcoin = environment.gearcoin;
