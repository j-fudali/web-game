import { Pipe, type PipeTransform } from '@angular/core';
import { GetWalletBalanceResult } from 'thirdweb/dist/types/wallets/utils/getWalletBalance';

@Pipe({
  name: 'jfudaliWalletBalance',
  standalone: true,
})
export class WalletBalancePipe implements PipeTransform {
  transform(value: GetWalletBalanceResult | undefined): string {
    if (!value) return '';
    const balance = Math.round(Number(value.displayValue) * 100) / 100;
    return `${balance} ${value.symbol}`;
  }
}
