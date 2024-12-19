import { resolveScheme } from 'thirdweb/storage';
import { ThirdwebConstants } from '../thirdweb/const/thirdweb.const';

export class IpfsConverter {
  public static convertIpfs(image: string) {
    if (!image.startsWith('ipfs://')) return '';
    return resolveScheme({
      client: ThirdwebConstants.CLIENT,
      uri: image,
    });
  }
}
