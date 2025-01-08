import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'jfudaliWalletAddress',
  standalone: true,
})
export class WalletAddressPipe implements PipeTransform {
  transform(value: string): string {
    return `${value.slice(0, 6)}...${value.slice(-4, -1)}`;
  }
}
