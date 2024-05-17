import { GetWalletBalanceResult } from 'thirdweb/dist/types/wallets/utils/getWalletBalance';
import { Account } from 'thirdweb/wallets';

export interface WalletData {
  account: Account;
  balance: GetWalletBalanceResult;
}
