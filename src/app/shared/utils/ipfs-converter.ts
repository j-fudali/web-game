import { resolveScheme } from 'thirdweb/storage';
import { THIRDWEB_CONSTANTS } from '../thirdweb/const/thirdweb.const';

export class IpfsConverter {
  public static convertIpfs(image: string) {
    if (!image.startsWith('ipfs://')) return '';
    return resolveScheme({
      client: THIRDWEB_CONSTANTS.CLIENT,
      uri: image,
    });
  }
}
