import { resolveScheme } from 'thirdweb/storage';
import { Contracts } from '../thirdweb/const/contracts.const';

export class IpfsConverter {
  public static convertIpfs(image: string) {
    if (!image.startsWith('ipfs://')) return '';
    return resolveScheme({
      client: Contracts.CLIENT,
      uri: image,
    });
  }
}
